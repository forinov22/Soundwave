using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Exceptions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class LikesService : ILikesService
{
    private readonly AppDbContext _context;

    public LikesService(AppDbContext context)
    {
        _context = context;
    }

    // ── Релизы ────────────────────────────────────────────────────────────────

    public async Task<bool> ToggleLikeReleaseAsync(int userId, int releaseId)
    {
        var release = await _context.Releases.FindAsync(releaseId)
            ?? throw new NotFoundException("Релиз не найден");

        if (release.Status != ReleaseStatus.Published)
            throw new ValidationException("Нельзя лайкнуть неопубликованный релиз");

        var existing = await _context.UserLikedReleases
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ReleaseId == releaseId);

        if (existing is not null)
        {
            _context.UserLikedReleases.Remove(existing);
            await _context.SaveChangesAsync();
            return false;
        }

        _context.UserLikedReleases.Add(new UserLikedRelease
        {
            UserId = userId,
            ReleaseId = releaseId,
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsReleaseLikedAsync(int userId, int releaseId)
    {
        return await _context.UserLikedReleases
            .AnyAsync(x => x.UserId == userId && x.ReleaseId == releaseId);
    }

    public async Task<IEnumerable<Release>> GetLikedReleasesAsync(int userId)
    {
        var releaseIds = await _context.UserLikedReleases
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.LikedAt)
            .Select(x => x.ReleaseId)
            .ToListAsync();

        if (!releaseIds.Any()) return [];

        var releases = await _context.Releases
            .Include(r => r.ReleaseTracks)
                .ThenInclude(rt => rt.Track)
            .Include(r => r.Artist)
            .Where(r => releaseIds.Contains(r.Id))
            .ToListAsync();

        // Сохраняем порядок (новее — выше)
        return releaseIds
            .Select(id => releases.FirstOrDefault(r => r.Id == id))
            .Where(r => r is not null)
            .Cast<Release>();
    }

    // ── Артисты ───────────────────────────────────────────────────────────────

    public async Task<bool> ToggleFollowArtistAsync(int userId, int artistId)
    {
        var artistExists = await _context.Users
            .AnyAsync(u => u.Id == artistId && u.Role == UserRole.Artist);

        if (!artistExists)
            throw new NotFoundException("Артист не найден");

        var existing = await _context.UserFollowedArtists
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ArtistId == artistId);

        if (existing is not null)
        {
            _context.UserFollowedArtists.Remove(existing);
            await _context.SaveChangesAsync();
            return false;
        }

        _context.UserFollowedArtists.Add(new UserFollowedArtist
        {
            UserId = userId,
            ArtistId = artistId,
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsArtistFollowedAsync(int userId, int artistId)
    {
        return await _context.UserFollowedArtists
            .AnyAsync(x => x.UserId == userId && x.ArtistId == artistId);
    }

    public async Task<IEnumerable<Artist>> GetFollowedArtistsAsync(int userId)
    {
        var artistIds = await _context.UserFollowedArtists
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.FollowedAt)
            .Select(x => x.ArtistId)
            .ToListAsync();

        if (!artistIds.Any()) return [];

        var artists = await _context.Users
            .OfType<Artist>()
            .Include(a => a.Tracks)
                .ThenInclude(t => t.ReleaseTracks)
                    .ThenInclude(rt => rt.Release)
            .Where(a => artistIds.Contains(a.Id))
            .ToListAsync();

        return artistIds
            .Select(id => artists.FirstOrDefault(a => a.Id == id))
            .Where(a => a is not null)
            .Cast<Artist>();
    }

    // ── Плейлисты ─────────────────────────────────────────────────────────────

    public async Task<bool> ToggleSavePlaylistAsync(int userId, int playlistId)
    {
        var playlist = await _context.Playlists.FindAsync(playlistId)
            ?? throw new NotFoundException("Плейлист не найден");

        if (playlist.OwnerId == userId)
            throw new ValidationException("Нельзя сохранить свой плейлист");

        if (!playlist.IsPublic)
            throw new ValidationException("Нельзя сохранить закрытый плейлист");

        var existing = await _context.UserSavedPlaylists
            .FirstOrDefaultAsync(x => x.UserId == userId && x.PlaylistId == playlistId);

        if (existing is not null)
        {
            _context.UserSavedPlaylists.Remove(existing);
            await _context.SaveChangesAsync();
            return false;
        }

        _context.UserSavedPlaylists.Add(new UserSavedPlaylist
        {
            UserId = userId,
            PlaylistId = playlistId,
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsPlaylistSavedAsync(int userId, int playlistId)
    {
        return await _context.UserSavedPlaylists
            .AnyAsync(x => x.UserId == userId && x.PlaylistId == playlistId);
    }

    public async Task<IEnumerable<Playlist>> GetSavedPlaylistsAsync(int userId)
    {
        var playlistIds = await _context.UserSavedPlaylists
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .Select(x => x.PlaylistId)
            .ToListAsync();

        if (!playlistIds.Any()) return [];

        var playlists = await _context.Playlists
            .Include(p => p.PlaylistTracks)
            .Include(p => p.Owner)
            .Where(p => playlistIds.Contains(p.Id))
            .ToListAsync();

        return playlistIds
            .Select(id => playlists.FirstOrDefault(p => p.Id == id))
            .Where(p => p is not null)
            .Cast<Playlist>();
    }
}
