using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.DTOs;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class ListenHistoryService : IListenHistoryService
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;
    private readonly MlServiceClient _mlClient;
    private readonly ILogger<ListenHistoryService> _logger;

    public ListenHistoryService(
        AppDbContext context,
        IStorageService storage,
        MlServiceClient mlClient,
        ILogger<ListenHistoryService> logger)
    {
        _context = context;
        _storage = storage;
        _mlClient = mlClient;
        _logger = logger;
    }

    public async Task RecordListenAsync(int userId, int trackId)
    {
        var track = await _context.Tracks.FindAsync(trackId);
        if (track == null) return;

        _context.ListenEvents.Add(new ListenEvent
        {
            UserId = userId,
            TrackId = trackId,
            ListenedAt = DateTime.UtcNow,
        });

        track.PlayCount++;
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ListenHistoryItemDto>> GetUserHistoryAsync(int userId, int limit = 20)
    {
        var events = await _context.ListenEvents
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.ListenedAt)
            .Take(limit * 3) // берём больше, потом дедуплицируем
            .Include(e => e.Track)
                .ThenInclude(t => t.Artist)
            .ToListAsync();

        // Дедупликация: оставляем только последнее прослушивание каждого трека
        return events
            .GroupBy(e => e.TrackId)
            .Select(g => g.First())
            .Take(limit)
            .Select(e => ToDto(e.Track, e.ListenedAt));
    }

    public async Task<IEnumerable<ListenHistoryItemDto>> GetRecommendationsAsync(int userId, int limit = 10)
    {
        // Берём последние прослушанные уникальные треки как seed
        var recentTrackIds = await _context.ListenEvents
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.ListenedAt)
            .Select(e => e.TrackId)
            .Distinct()
            .Take(5)
            .ToListAsync();

        if (recentTrackIds.Count == 0)
        {
            // Нет истории — возвращаем топ по PlayCount
            var trending = await _context.Tracks
                .Include(t => t.Artist)
                .Where(t => t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published))
                .OrderByDescending(t => t.PlayCount)
                .Take(limit)
                .ToListAsync();
            return trending.Select(t => ToDto(t, null));
        }

        var listenedSet = new HashSet<int>(recentTrackIds);
        var candidateIds = new HashSet<int>();

        // Запрашиваем похожие для каждого seed-трека
        foreach (var seedId in recentTrackIds)
        {
            try
            {
                var similar = await _mlClient.GetSimilarTracksAsync(seedId.ToString(), k: limit);
                foreach (var id in similar)
                {
                    if (!listenedSet.Contains(id))
                        candidateIds.Add(id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("ML similar request failed for track {Id}: {Msg}", seedId, ex.Message);
            }
        }

        if (candidateIds.Count == 0)
        {
            // ML не вернул ничего — fallback на trending
            var trending = await _context.Tracks
                .Include(t => t.Artist)
                .Where(t =>
                    !listenedSet.Contains(t.Id) &&
                    t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published))
                .OrderByDescending(t => t.PlayCount)
                .Take(limit)
                .ToListAsync();
            return trending.Select(t => ToDto(t, null));
        }

        var idList = candidateIds.Take(limit * 2).ToList();
        var tracks = await _context.Tracks
            .Include(t => t.Artist)
            .Where(t =>
                idList.Contains(t.Id) &&
                t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published))
            .Take(limit)
            .ToListAsync();

        return tracks.Select(t => ToDto(t, null));
    }

    public async Task<ArtistStatsDto> GetArtistStatsAsync(int artistId)
    {
        var totalTracks = await _context.Tracks
            .CountAsync(t => t.ArtistId == artistId);

        var totalReleases = await _context.Releases
            .CountAsync(r => r.ArtistId == artistId && r.Status == ReleaseStatus.Published);

        var followers = await _context.UserFollowedArtists
            .CountAsync(f => f.ArtistId == artistId);

        var totalPlays = await _context.Tracks
            .Where(t => t.ArtistId == artistId)
            .SumAsync(t => t.PlayCount);

        var topTracks = await _context.Tracks
            .Where(t =>
                t.ArtistId == artistId &&
                t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published))
            .OrderByDescending(t => t.PlayCount)
            .Take(5)
            .Select(t => new TopTrackDto(
                t.Id,
                t.Title,
                string.IsNullOrEmpty(t.ImageS3Path) ? null : _storage.GetPresignedUrl(t.ImageS3Path),
                t.PlayCount,
                t.DurationSeconds))
            .ToListAsync();

        return new ArtistStatsDto(totalPlays, totalTracks, totalReleases, followers, topTracks);
    }

    private ListenHistoryItemDto ToDto(Track track, DateTime? listenedAt) =>
        new(
            TrackId: track.Id,
            Title: track.Title,
            ImageUrl: string.IsNullOrEmpty(track.ImageS3Path) ? null : _storage.GetPresignedUrl(track.ImageS3Path),
            AudioUrl: _storage.GetPresignedUrl(track.AudioS3Path),
            ArtistId: track.ArtistId,
            ArtistName: track.Artist?.Name ?? string.Empty,
            DurationSeconds: track.DurationSeconds,
            PlayCount: track.PlayCount,
            ListenedAt: listenedAt ?? DateTime.UtcNow
        );
}
