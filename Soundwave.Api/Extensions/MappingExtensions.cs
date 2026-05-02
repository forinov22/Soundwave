using Soundwave.Api.DTOs;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Extensions;

public static class MappingExtensions
{
    public static ArtistDetailsDto ToDto(this Artist a, IStorageService storage)
    {
        var totalPlays = a.Tracks.Sum(t => t.PlayCount);

        return new ArtistDetailsDto(
            a.Id,
            a.Name,
            a.BackgroundImage != null ? storage.GetPresignedUrl(a.BackgroundImage) : null,
            a.Description ?? "Биография уточняется...",
            totalPlays
        );
    }
    
    // ── Track ──────────────────────────────────────────────────────────────

    public static TrackDto ToDto(this Track track, IStorageService storage)
    {
        return new TrackDto(
            Id: track.Id,
            Title: track.Title,
            AudioUrl: storage.GetPresignedUrl(track.AudioS3Path),
            ImageUrl: storage.GetPresignedUrl(track.ImageS3Path),
            DurationSeconds: track.DurationSeconds,
            ArtistName: track.Artist?.Name ?? string.Empty,
            ArtistId: track.ArtistId
        );
    }

    // Расширенный DTO для плейграунда: ожидает что у Track загружены
    // ReleaseTracks → Release. Если нет — Releases будет пустым.
    public static ArtistTrackDto ToArtistDto(this Track track, IStorageService storage)
    {
        var releases = track.ReleaseTracks
            .Select(rt => new TrackReleaseRefDto(
                Id: rt.Release.Id,
                Title: rt.Release.Title,
                Status: rt.Release.Status.ToString()))
            .ToList();

        return new ArtistTrackDto(
            Id: track.Id,
            Title: track.Title,
            AudioUrl: storage.GetPresignedUrl(track.AudioS3Path),
            ImageUrl: storage.GetPresignedUrl(track.ImageS3Path),
            DurationSeconds: track.DurationSeconds,
            ArtistName: track.Artist?.Name ?? string.Empty,
            ArtistId: track.ArtistId,
            CreatedAt: track.CreatedAt,
            Releases: releases
        );
    }

    // ── Release ────────────────────────────────────────────────────────────

    // Лёгкий DTO для витрин и списков. Картинка релиза, если есть;
    // иначе для сингла подтягиваем из единственного трека.
    public static ReleaseDto ToDto(this Release release, IStorageService storage)
    {
        var trackCount = release.ReleaseTracks?.Count ?? 0;
        var imageKey = ResolveImageKey(release);

        return new ReleaseDto(
            Id: release.Id,
            Title: release.Title,
            Description: release.Description,
            ImageUrl: imageKey is null ? null : storage.GetPresignedUrl(imageKey),
            BgColor: release.BgColor,
            Status: release.Status.ToString(),
            Type: GetReleaseType(trackCount).ToString(),
            ReleaseDate: release.ReleaseDate,
            PublishedAt: release.PublishedAt,
            TrackCount: trackCount,
            ArtistId: release.ArtistId,
            ArtistName: release.Artist?.Name ?? string.Empty
        );
    }

    // Детальный DTO с треками. Ожидает загруженные ReleaseTracks → Track.
    public static ReleaseDetailsDto ToDetailsDto(this Release release, IStorageService storage)
    {
        var orderedTracks = (release.ReleaseTracks ?? [])
            .OrderBy(rt => rt.Position)
            .Select(rt => rt.Track.ToDto(storage))
            .ToList();

        var imageKey = ResolveImageKey(release);

        return new ReleaseDetailsDto(
            Id: release.Id,
            Title: release.Title,
            Description: release.Description,
            ImageUrl: imageKey is null ? null : storage.GetPresignedUrl(imageKey),
            BgColor: release.BgColor,
            Status: release.Status.ToString(),
            Type: GetReleaseType(orderedTracks.Count).ToString(),
            ReleaseDate: release.ReleaseDate,
            PublishedAt: release.PublishedAt,
            ArtistId: release.ArtistId,
            ArtistName: release.Artist?.Name ?? string.Empty,
            Tracks: orderedTracks
        );
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    // Если у релиза нет своей обложки и в нём ровно один трек —
    // подтягиваем обложку трека (правило для сингла).
    private static string? ResolveImageKey(Release release)
    {
        if (!string.IsNullOrEmpty(release.ImageS3Path))
            return release.ImageS3Path;

        var tracks = release.ReleaseTracks;
        if (tracks is { Count: 1 })
        {
            var only = tracks.First().Track;
            if (only is not null && !string.IsNullOrEmpty(only.ImageS3Path))
                return only.ImageS3Path;
        }

        return null;
    }

    private static ReleaseType GetReleaseType(int trackCount) => trackCount switch
    {
        <= 1 => ReleaseType.Single,
        <= 6 => ReleaseType.EP,
        _    => ReleaseType.Album,
    };
}