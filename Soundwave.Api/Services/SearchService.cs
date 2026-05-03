using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.DTOs;
using Soundwave.Api.Entities;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class SearchService
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;

    // Лимиты на секцию при поиске "Все"
    private const int TrackLimit   = 4;
    private const int ReleaseLimit = 5;
    private const int ArtistLimit  = 5;
    private const int PlaylistLimit = 4;

    public SearchService(AppDbContext context, IStorageService storage)
    {
        _context = context;
        _storage = storage;
    }

    public async Task<SearchResultDto> SearchAsync(string query, string? type = null)
    {
        if (string.IsNullOrWhiteSpace(query))
            return Empty();

        var q = query.Trim().ToLower();

        var tracks    = new List<TrackDto>();
        var releases  = new List<ReleaseDto>();
        var artists   = new List<ArtistSearchDto>();
        var playlists = new List<PlaylistSearchDto>();

        // Запускаем нужные запросы в зависимости от type
        var searchAll     = string.IsNullOrEmpty(type) || type == "All";
        var searchTracks  = searchAll || type == "Tracks";
        var searchReleases = searchAll || type == "Releases";
        var searchArtists = searchAll || type == "Artists";
        var searchPlaylists = searchAll || type == "Playlists";

        var tasks = new List<Task>();

        if (searchTracks)
            tasks.Add(SearchTracksAsync(q, TrackLimit)
                .ContinueWith(t => tracks = t.Result));

        if (searchReleases)
            tasks.Add(SearchReleasesAsync(q, ReleaseLimit)
                .ContinueWith(t => releases = t.Result));

        if (searchArtists)
            tasks.Add(SearchArtistsAsync(q, ArtistLimit)
                .ContinueWith(t => artists = t.Result));

        if (searchPlaylists)
            tasks.Add(SearchPlaylistsAsync(q, PlaylistLimit)
                .ContinueWith(t => playlists = t.Result));

        await Task.WhenAll(tasks);

        // TopResult — первый найденный среди треков, потом релизов, потом артистов
        SearchTrackDto? topResult = null;

        if (tracks.Count > 0)
        {
            var t = tracks[0];
            topResult = new SearchTrackDto(t.Id, t.Title, t.ImageUrl, t.ArtistName, "Track");
        }
        else if (releases.Count > 0)
        {
            var r = releases[0];
            topResult = new SearchTrackDto(r.Id, r.Title, r.ImageUrl, r.ArtistName, r.Type);
        }
        else if (artists.Count > 0)
        {
            var a = artists[0];
            topResult = new SearchTrackDto(a.Id, a.Name, a.AvatarUrl, "", "Artist");
        }

        return new SearchResultDto(topResult, tracks, releases, artists, playlists);
    }

    // ── Приватные методы поиска ───────────────────────────────────────────────

    private async Task<List<TrackDto>> SearchTracksAsync(string q, int limit)
    {
        return await _context.Tracks
            .Include(t => t.Artist)
            .Where(t =>
                t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published) &&
                (t.Title.ToLower().Contains(q) || t.Artist.Name.ToLower().Contains(q)))
            .OrderByDescending(t => t.PlayCount)
            .Take(limit)
            .Select(t => new TrackDto(
                t.Id,
                t.Title,
                _storage.GetPresignedUrl(t.AudioS3Path),
                _storage.GetPresignedUrl(t.ImageS3Path),
                t.DurationSeconds,
                t.Artist.Name,
                t.ArtistId,
                t.PlayCount))
            .ToListAsync();
    }

    private async Task<List<ReleaseDto>> SearchReleasesAsync(string q, int limit)
    {
        var releases = await _context.Releases
            .Include(r => r.Artist)
            .Include(r => r.ReleaseTracks)
            .Where(r =>
                r.Status == ReleaseStatus.Published &&
                (r.Title.ToLower().Contains(q) || r.Artist.Name.ToLower().Contains(q)))
            .OrderByDescending(r => r.PublishedAt)
            .Take(limit)
            .ToListAsync();

        return releases.Select(r => r.ToDto(_storage)).ToList();
    }

    private async Task<List<ArtistSearchDto>> SearchArtistsAsync(string q, int limit)
    {
        return await _context.Users
            .OfType<Artist>()
            .Where(a => a.Name.ToLower().Contains(q))
            .OrderBy(a => a.Name)
            .Take(limit)
            .Select(a => new ArtistSearchDto(
                a.Id,
                a.Name,
                string.IsNullOrEmpty(a.Avatar)
                    ? null
                    : _storage.GetPresignedUrl(a.Avatar)))
            .ToListAsync();
    }

    private async Task<List<PlaylistSearchDto>> SearchPlaylistsAsync(string q, int limit)
    {
        return await _context.Playlists
            .Include(p => p.Owner)
            .Where(p =>
                p.IsPublic &&
                !p.IsLikedSongs &&
                p.Title.ToLower().Contains(q))
            .OrderBy(p => p.Title)
            .Take(limit)
            .Select(p => new PlaylistSearchDto(
                p.Id,
                p.Title,
                string.IsNullOrEmpty(p.ImageS3Path)
                    ? null
                    : _storage.GetPresignedUrl(p.ImageS3Path),
                p.Owner.Name))
            .ToListAsync();
    }

    private static SearchResultDto Empty() => new(
        null,
        [],
        [],
        [],
        []);
}