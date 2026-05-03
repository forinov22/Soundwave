using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Exceptions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class PlaylistService : IPlaylistService
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;

    public PlaylistService(AppDbContext context, IStorageService storage)
    {
        _context = context;
        _storage = storage;
    }

    // ── Читать ────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(int userId)
    {
        return await _context.Playlists
            .Include(p => p.PlaylistTracks)
            .Where(p => p.OwnerId == userId)
            // Любимые треки всегда первыми
            .OrderByDescending(p => p.IsLikedSongs)
            .ThenByDescending(p => p.Id)
            .ToListAsync();
    }

    public async Task<Playlist?> GetByIdAsync(int playlistId, int? requestingUserId)
    {
        var playlist = await _context.Playlists
            .Include(p => p.Owner)
            .Include(p => p.PlaylistTracks.OrderBy(pt => pt.Position))
                .ThenInclude(pt => pt.Track)
                    .ThenInclude(t => t.Artist)
            .Include(p => p.PlaylistTracks)
                .ThenInclude(pt => pt.Track)
                    .ThenInclude(t => t.ReleaseTracks)
                        .ThenInclude(rt => rt.Release)
            .FirstOrDefaultAsync(p => p.Id == playlistId);

        if (playlist is null) return null;

        // Приватный плейлист — только владелец
        if (!playlist.IsPublic && playlist.OwnerId != requestingUserId)
            return null;

        return playlist;
    }

    public async Task<Playlist?> GetLikedSongsPlaylistAsync(int userId)
    {
        return await _context.Playlists
            .Include(p => p.PlaylistTracks.OrderBy(pt => pt.Position))
                .ThenInclude(pt => pt.Track)
                    .ThenInclude(t => t.Artist)
            .FirstOrDefaultAsync(p => p.OwnerId == userId && p.IsLikedSongs);
    }

    // ── Создать ───────────────────────────────────────────────────────────────

    public async Task<Playlist> CreateAsync(int userId, string? title = null)
    {
        // Автогенерация названия: "Мой плейлист #N"
        if (string.IsNullOrWhiteSpace(title))
        {
            var count = await _context.Playlists
                .CountAsync(p => p.OwnerId == userId && !p.IsLikedSongs);
            title = $"Мой плейлист #{count + 1}";
        }

        var playlist = new Playlist
        {
            Title = title,
            OwnerId = userId,
            IsPublic = false,
        };

        _context.Playlists.Add(playlist);
        await _context.SaveChangesAsync();
        return playlist;
    }

    // Вызывается при регистрации пользователя.
    public async Task<Playlist> CreateLikedSongsPlaylistAsync(int userId)
    {
        var existing = await _context.Playlists
            .FirstOrDefaultAsync(p => p.OwnerId == userId && p.IsLikedSongs);
        if (existing is not null) return existing;

        var playlist = new Playlist
        {
            Title = "Любимые треки",
            OwnerId = userId,
            IsPublic = false,
            IsLikedSongs = true,
        };
        _context.Playlists.Add(playlist);
        await _context.SaveChangesAsync();
        return playlist;
    }

    // ── Обновить ──────────────────────────────────────────────────────────────

    public async Task<Playlist> UpdateAsync(
        int playlistId,
        int userId,
        string? title,
        string? description,
        bool? isPublic,
        Stream? imageStream,
        string? imageFileName,
        string? imageContentType)
    {
        var playlist = await LoadOwnedAsync(playlistId, userId);

        if (playlist.IsLikedSongs)
            throw new ValidationException("Системный плейлист нельзя редактировать");

        if (title is not null && !string.IsNullOrWhiteSpace(title))
            playlist.Title = title.Trim();

        if (description is not null)
            playlist.Description = description;

        if (isPublic is not null)
            playlist.IsPublic = isPublic.Value;

        if (imageStream is not null && imageFileName is not null && imageContentType is not null)
        {
            var oldKey = playlist.ImageS3Path;
            playlist.ImageS3Path = await _storage.UploadFileAsync(
                imageStream, imageFileName, imageContentType, "images/playlists");

            if (!string.IsNullOrEmpty(oldKey))
            {
                try { await _storage.DeleteFileAsync(oldKey); } catch { }
            }
        }

        await _context.SaveChangesAsync();
        return playlist;
    }

    // ── Удалить ───────────────────────────────────────────────────────────────

    public async Task DeleteAsync(int playlistId, int userId)
    {
        var playlist = await LoadOwnedAsync(playlistId, userId);

        if (playlist.IsLikedSongs)
            throw new ValidationException("Системный плейлист нельзя удалить");

        _context.Playlists.Remove(playlist);

        if (!string.IsNullOrEmpty(playlist.ImageS3Path))
        {
            try { await _storage.DeleteFileAsync(playlist.ImageS3Path); } catch { }
        }

        await _context.SaveChangesAsync();
    }

    // ── Треки ─────────────────────────────────────────────────────────────────

    public async Task AddTrackAsync(int playlistId, int userId, int trackId)
    {
        var playlist = await LoadOwnedAsync(playlistId, userId);

        // Трек должен быть в опубликованном релизе
        var track = await _context.Tracks
            .Include(t => t.ReleaseTracks)
                .ThenInclude(rt => rt.Release)
            .FirstOrDefaultAsync(t => t.Id == trackId);

        if (track is null)
            throw new NotFoundException("Трек не найден");

        bool isPublished = track.ReleaseTracks
            .Any(rt => rt.Release.Status == ReleaseStatus.Published);

        if (!isPublished)
            throw new ValidationException("Нельзя добавить неопубликованный трек");

        // Дубликаты запрещены
        bool alreadyIn = await _context.PlaylistTracks
            .AnyAsync(pt => pt.PlaylistId == playlistId && pt.TrackId == trackId);

        if (alreadyIn)
            throw new ConflictException("Трек уже в плейлисте");

        var maxPosition = await _context.PlaylistTracks
            .Where(pt => pt.PlaylistId == playlistId)
            .MaxAsync(pt => (int?)pt.Position) ?? 0;

        _context.PlaylistTracks.Add(new PlaylistTrack
        {
            PlaylistId = playlistId,
            TrackId = trackId,
            Position = maxPosition + 1,
        });

        await _context.SaveChangesAsync();
    }

    public async Task RemoveTrackAsync(int playlistId, int userId, int trackId)
    {
        var playlist = await LoadOwnedAsync(playlistId, userId);

        var pt = await _context.PlaylistTracks
            .FirstOrDefaultAsync(pt => pt.PlaylistId == playlistId && pt.TrackId == trackId);

        if (pt is null)
            throw new NotFoundException("Трек не найден в плейлисте");

        _context.PlaylistTracks.Remove(pt);

        // Перенумерация позиций
        var remaining = await _context.PlaylistTracks
            .Where(p => p.PlaylistId == playlistId)
            .OrderBy(p => p.Position)
            .ToListAsync();

        for (int i = 0; i < remaining.Count; i++)
            remaining[i].Position = i + 1;

        await _context.SaveChangesAsync();
    }

    // ── Лайк ─────────────────────────────────────────────────────────────────

    // Возвращает true если трек добавлен, false если убран (toggle).
    public async Task<bool> ToggleLikeAsync(int userId, int trackId)
    {
        var liked = await GetLikedSongsPlaylistAsync(userId)
            ?? await CreateLikedSongsPlaylistAsync(userId);

        var existing = await _context.PlaylistTracks
            .FirstOrDefaultAsync(pt => pt.PlaylistId == liked.Id && pt.TrackId == trackId);

        if (existing is not null)
        {
            _context.PlaylistTracks.Remove(existing);
            await _context.SaveChangesAsync();
            return false; // убран
        }

        await AddTrackAsync(liked.Id, userId, trackId);
        return true; // добавлен
    }

    public async Task<bool> IsLikedAsync(int userId, int trackId)
    {
        var liked = await _context.Playlists
            .FirstOrDefaultAsync(p => p.OwnerId == userId && p.IsLikedSongs);

        if (liked is null) return false;

        return await _context.PlaylistTracks
            .AnyAsync(pt => pt.PlaylistId == liked.Id && pt.TrackId == trackId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Playlist> LoadOwnedAsync(int playlistId, int userId)
    {
        var playlist = await _context.Playlists
            .Include(p => p.PlaylistTracks)
            .FirstOrDefaultAsync(p => p.Id == playlistId);

        if (playlist is null) throw new NotFoundException("Плейлист не найден");
        if (playlist.OwnerId != userId) throw new ForbiddenException("Нет доступа");

        return playlist;
    }
}