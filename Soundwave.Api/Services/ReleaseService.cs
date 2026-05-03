using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Exceptions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class ReleaseService : IReleaseService
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;

    public ReleaseService(AppDbContext context, IStorageService storage)
    {
        _context = context;
        _storage = storage;
    }

    // ── Чтение ───────────────────────────────────────────────────────────────

    public Task<Release?> GetByIdWithTracksAsync(int id)
    {
        return _context.Releases
            .Include(r => r.Artist)
            .Include(r => r.ReleaseTracks.OrderBy(rt => rt.Position))
                .ThenInclude(rt => rt.Track)
                    .ThenInclude(t => t.Artist)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<Release>> GetMyDraftsAsync(int artistId)
    {
        return await _context.Releases
            .Include(r => r.ReleaseTracks.OrderBy(rt => rt.Position))
                .ThenInclude(rt => rt.Track)
            .Where(r => r.ArtistId == artistId && r.Status == ReleaseStatus.Draft)
            .OrderByDescending(r => r.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Release>> GetMyPublishedAsync(int artistId)
    {
        // Архивированные тоже показываем артисту — ему полезно их видеть.
        // Если решим скрывать — добавим вторую вкладку «Архив».
        return await _context.Releases
            .Include(r => r.ReleaseTracks.OrderBy(rt => rt.Position))
                .ThenInclude(rt => rt.Track)
            .Where(r => r.ArtistId == artistId
                        && r.Status != ReleaseStatus.Draft)
            .OrderByDescending(r => r.PublishedAt)
            .ToListAsync();
    }

    // ── Создание / редактирование черновика ─────────────────────────────────

    public async Task<Release> CreateDraftAsync(
        int artistId,
        string title,
        string? description,
        DateTime? releaseDate,
        Stream? imageStream,
        string? imageFileName,
        string? imageContentType)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ValidationException("Название обязательно");

        string? imageKey = null;
        if (imageStream is not null && imageFileName is not null && imageContentType is not null)
        {
            imageKey = await _storage.UploadFileAsync(
                imageStream, imageFileName, imageContentType, "images/releases");
        }

        var release = new Release
        {
            Title = title.Trim(),
            Description = description,
            ReleaseDate = releaseDate,
            ImageS3Path = imageKey,
            ArtistId = artistId,
            Status = ReleaseStatus.Draft,
        };

        _context.Releases.Add(release);
        await _context.SaveChangesAsync();
        return release;
    }

    public async Task<Release> UpdateDraftAsync(
        int releaseId,
        int artistId,
        string? title,
        string? description,
        DateTime? releaseDate,
        Stream? imageStream,
        string? imageFileName,
        string? imageContentType)
    {
        var release = await LoadOwnedDraftAsync(releaseId, artistId);

        if (title is not null)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ValidationException("Название не может быть пустым");
            release.Title = title.Trim();
        }

        if (description is not null)
            release.Description = description;

        if (releaseDate is not null)
            release.ReleaseDate = releaseDate;

        if (imageStream is not null && imageFileName is not null && imageContentType is not null)
        {
            var oldKey = release.ImageS3Path;
            release.ImageS3Path = await _storage.UploadFileAsync(
                imageStream, imageFileName, imageContentType, "images/releases");

            if (!string.IsNullOrEmpty(oldKey))
            {
                try { await _storage.DeleteFileAsync(oldKey); } catch { /* ignore */ }
            }
        }

        release.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return release;
    }

    // ── Состав треков ────────────────────────────────────────────────────────

    public async Task AddTrackAsync(int releaseId, int artistId, int trackId)
    {
        var release = await LoadOwnedDraftAsync(releaseId, artistId);

        var track = await _context.Tracks
            .FirstOrDefaultAsync(t => t.Id == trackId);

        if (track is null)
            throw new NotFoundException("Трек не найден");

        if (track.ArtistId != artistId)
            throw new ForbiddenException("Это не ваш трек");

        // Защита от дублей
        if (release.ReleaseTracks.Any(rt => rt.TrackId == trackId))
            throw new ConflictException("Этот трек уже в релизе");

        // Position = max + 1. Если коллекция пуста — начинаем с 1.
        var nextPosition = release.ReleaseTracks.Count == 0
            ? 1
            : release.ReleaseTracks.Max(rt => rt.Position) + 1;

        release.ReleaseTracks.Add(new ReleaseTrack
        {
            ReleaseId = release.Id,
            TrackId = track.Id,
            Position = nextPosition,
        });

        release.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task RemoveTrackAsync(int releaseId, int artistId, int trackId)
    {
        var release = await LoadOwnedDraftAsync(releaseId, artistId);

        var link = release.ReleaseTracks.FirstOrDefault(rt => rt.TrackId == trackId);
        if (link is null)
            throw new NotFoundException("Трек не найден в релизе");

        release.ReleaseTracks.Remove(link);

        // После удаления переразложим позиции 1..N, чтобы не было дыр
        // (они потом мешают уникальному индексу при свопе позиций).
        var i = 1;
        foreach (var rt in release.ReleaseTracks.OrderBy(rt => rt.Position))
            rt.Position = i++;

        release.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task ReorderTracksAsync(int releaseId, int artistId, IList<int> trackIdsInOrder)
    {
        var release = await LoadOwnedDraftAsync(releaseId, artistId);

        // Валидация: набор должен совпадать с текущим
        var currentIds = release.ReleaseTracks.Select(rt => rt.TrackId).ToHashSet();
        var providedIds = trackIdsInOrder.ToHashSet();

        if (currentIds.Count != providedIds.Count || !currentIds.SetEquals(providedIds))
            throw new ValidationException("Список треков для реордера не совпадает с текущим составом релиза");

        // У нас уникальный индекс (ReleaseId, Position), поэтому
        // прямое присваивание новых позиций сломается из-за временных коллизий.
        // Решение: сначала уводим всех в отрицательные значения, потом ставим финальные.
        var byTrackId = release.ReleaseTracks.ToDictionary(rt => rt.TrackId);
        var tmp = -1;
        foreach (var rt in release.ReleaseTracks)
            rt.Position = tmp--;
        await _context.SaveChangesAsync();

        for (var i = 0; i < trackIdsInOrder.Count; i++)
            byTrackId[trackIdsInOrder[i]].Position = i + 1;

        release.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    // ── Публикация ───────────────────────────────────────────────────────────

    public async Task<Release> PublishAsync(int releaseId, int artistId)
    {
        var release = await LoadOwnedDraftAsync(releaseId, artistId);

        // 1. Хотя бы 1 трек
        if (release.ReleaseTracks.Count == 0)
            throw new ValidationException("В релизе должен быть хотя бы один трек");

        // 2. Title
        if (string.IsNullOrWhiteSpace(release.Title))
            throw new ValidationException("Название релиза обязательно");

        // 3. Обложка: своя ИЛИ (для сингла) у трека
        if (string.IsNullOrEmpty(release.ImageS3Path))
        {
            var isSingle = release.ReleaseTracks.Count == 1;
            var trackHasImage = isSingle &&
                !string.IsNullOrEmpty(release.ReleaseTracks.First().Track.ImageS3Path);

            if (!isSingle || !trackHasImage)
                throw new ValidationException(
                    "У релиза должна быть обложка (или у единственного трека сингла)");
        }

        // 4. Ни один трек не должен быть в другом опубликованном релизе.
        // Тянем из БД: на навигационных свойствах загружен только текущий релиз.
        var trackIds = release.ReleaseTracks.Select(rt => rt.TrackId).ToList();

        var conflicts = await _context.ReleaseTracks
            .Include(rt => rt.Release)
            .Where(rt => trackIds.Contains(rt.TrackId)
                         && rt.ReleaseId != release.Id
                         && rt.Release.Status == ReleaseStatus.Published)
            .Select(rt => new
            {
                rt.TrackId,
                ReleaseId = rt.Release.Id,
                ReleaseTitle = rt.Release.Title,
            })
            .ToListAsync();

        if (conflicts.Count > 0)
        {
            throw new ConflictException(
                "Некоторые треки уже опубликованы в других релизах",
                new { conflicts });
        }
        
        // Все треки релиза должны быть обработаны ML-сервисом
        var notReadyTracks = release.ReleaseTracks
            .Select(rt => rt.Track)
            .Where(t => t.ProcessingStatus != TrackProcessingStatus.Ready)
            .ToList();

        if (notReadyTracks.Count > 0)
        {
            var statusList = notReadyTracks
                .Select(t => new { t.Id, t.Title, Status = t.ProcessingStatus.ToString() })
                .ToList();
            throw new ConflictException(
                "Некоторые треки ещё не обработаны. Дождитесь завершения обработки.",
                new { notReadyTracks = statusList });
        }

        // Всё ок — публикуем
        var now = DateTime.UtcNow;
        release.Status = ReleaseStatus.Published;
        release.PublishedAt = now;
        release.ReleaseDate ??= now;
        release.UpdatedAt = now;

        await _context.SaveChangesAsync();
        return release;
    }

    // ── Удаление ─────────────────────────────────────────────────────────────

    public async Task DeleteAsync(int releaseId, int artistId)
    {
        var release = await _context.Releases
            .Include(r => r.ReleaseTracks)
            .FirstOrDefaultAsync(r => r.Id == releaseId);

        if (release is null)
            throw new NotFoundException("Релиз не найден");

        if (release.ArtistId != artistId)
            throw new ForbiddenException("Это не ваш релиз");

        switch (release.Status)
        {
            case ReleaseStatus.Draft:
                // Hard delete. ReleaseTracks улетят каскадом.
                _context.Releases.Remove(release);
                if (!string.IsNullOrEmpty(release.ImageS3Path))
                {
                    try { await _storage.DeleteFileAsync(release.ImageS3Path); } catch { }
                }
                break;

            case ReleaseStatus.Published:
                // Soft delete: статус → Archived. Сам релиз и связи
                // ReleaseTracks сохраняются (релиз остаётся в БД для аудита,
                // и потенциально его можно вернуть из архива в будущем).
                //
                // Но треки релиза должны исчезнуть из всех плейлистов и из
                // лайков пользователей — иначе слушатели увидят неиграющие
                // треки. Инвариант публикации гарантирует, что каждый трек
                // в этом релизе НЕ опубликован больше нигде, так что мы
                // безопасно убираем его отовсюду.
                await CleanupPublicReferencesAsync(release);
                release.Status = ReleaseStatus.Archived;
                release.UpdatedAt = DateTime.UtcNow;
                break;

            case ReleaseStatus.Archived:
                // Идемпотентно
                return;
        }

        await _context.SaveChangesAsync();
    }

    // Убирает треки релиза из всех плейлистов и из лайков всех пользователей.
    // Вызывается при архивации опубликованного релиза.
    private async Task CleanupPublicReferencesAsync(Release release)
    {
        var trackIds = release.ReleaseTracks.Select(rt => rt.TrackId).ToList();
        if (trackIds.Count == 0) return;

        // Плейлисты, в которых есть хотя бы один трек этого релиза.
        var playlistsWithTracks = await _context.Playlists
            .Include(p => p.PlaylistTracks.Where(pt => trackIds.Contains(pt.TrackId)))
            .Where(p => p.PlaylistTracks.Any(pt => trackIds.Contains(pt.TrackId)))
            .ToListAsync();

        foreach (var playlist in playlistsWithTracks)
        {
            var toRemove = playlist.PlaylistTracks.Where(pt => trackIds.Contains(pt.TrackId)).ToList();
            foreach (var pt in toRemove)
                playlist.PlaylistTracks.Remove(pt);
        }

        // Лайкнутые треки (User.LikedTracks). Тот же подход:
        // подгружаем пользователей, у которых есть лайки на наши треки,
        // и убираем эти лайки.
        var usersWithLikes = await _context.Users
            .Include(u => u.LikedTracks.Where(t => trackIds.Contains(t.Id)))
            .Where(u => u.LikedTracks.Any(t => trackIds.Contains(t.Id)))
            .ToListAsync();

        foreach (var user in usersWithLikes)
        {
            var toUnlike = user.LikedTracks.Where(t => trackIds.Contains(t.Id)).ToList();
            foreach (var t in toUnlike)
                user.LikedTracks.Remove(t);
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    // Загружает черновик, проверяет владельца и статус.
    // Все операции редактирования начинаются отсюда.
    private async Task<Release> LoadOwnedDraftAsync(int releaseId, int artistId)
    {
        var release = await _context.Releases
            .Include(r => r.ReleaseTracks)
                .ThenInclude(rt => rt.Track)
            .FirstOrDefaultAsync(r => r.Id == releaseId);

        if (release is null)
            throw new NotFoundException("Релиз не найден");

        if (release.ArtistId != artistId)
            throw new ForbiddenException("Это не ваш релиз");

        if (release.Status != ReleaseStatus.Draft)
            throw new ConflictException(
                "Редактировать можно только черновик. Опубликованный релиз заморожен.");

        return release;
    }
}