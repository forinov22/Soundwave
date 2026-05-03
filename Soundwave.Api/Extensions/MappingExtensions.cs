using Soundwave.Api.DTOs;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Extensions;

public static class MappingExtensions
{
    public static ArtistDetailsDto ToDto(this Artist artist, IStorageService storage)
    {
        return new ArtistDetailsDto(
            Id: artist.Id,
            Name: artist.Name,
            AvatarUrl: string.IsNullOrEmpty(artist.Avatar)
                ? null
                : storage.GetPresignedUrl(artist.Avatar),
            BannerUrl: string.IsNullOrEmpty(artist.BackgroundImage)
                ? null
                : storage.GetPresignedUrl(artist.BackgroundImage),
            Description: artist.Description,
            MonthlyListeners: artist.Tracks
                .SelectMany(t => t.ReleaseTracks)
                .Where(rt => rt.Release.Status == ReleaseStatus.Published)
                .Sum(rt => rt.Track.PlayCount)
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
            ArtistId: track.ArtistId,
            PlayCount: track.PlayCount
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
    
    public static PlaylistSummaryDto ToSummaryDto(this Playlist playlist, IStorageService storage)
    {
        return new PlaylistSummaryDto(
            Id: playlist.Id,
            Title: playlist.Title,
            ImageUrl: string.IsNullOrEmpty(playlist.ImageS3Path)
                ? null
                : storage.GetPresignedUrl(playlist.ImageS3Path),
            TrackCount: playlist.PlaylistTracks?.Count ?? 0,
            IsLikedSongs: playlist.IsLikedSongs,
            IsPublic: playlist.IsPublic
        );
    }
 
    public static PlaylistDetailsDto ToDetailsDto(this Playlist playlist, IStorageService storage)
    {
        var tracks = (playlist.PlaylistTracks ?? [])
            .OrderBy(pt => pt.Position)
            .Select(pt => new PlaylistTrackDto(
                Id: pt.Track.Id,
                Title: pt.Track.Title,
                AudioUrl: storage.GetPresignedUrl(pt.Track.AudioS3Path),
                ImageUrl: storage.GetPresignedUrl(pt.Track.ImageS3Path),
                DurationSeconds: pt.Track.DurationSeconds,
                ArtistName: pt.Track.Artist?.Name ?? string.Empty,
                ArtistId: pt.Track.ArtistId,
                AlbumTitle: pt.Track.ReleaseTracks
                    .Where(rt => rt.Release.Status == ReleaseStatus.Published)
                    .Select(rt => rt.Release.Title)
                    .FirstOrDefault(),
                AddedAt: pt.AddedAt,
                PlayCount: pt.Track.PlayCount
            ))
            .ToList();
 
        return new PlaylistDetailsDto(
            Id: playlist.Id,
            Title: playlist.Title,
            Description: playlist.Description,
            ImageUrl: string.IsNullOrEmpty(playlist.ImageS3Path)
                ? null
                : storage.GetPresignedUrl(playlist.ImageS3Path),
            IsPublic: playlist.IsPublic,
            IsLikedSongs: playlist.IsLikedSongs,
            OwnerId: playlist.OwnerId,
            OwnerName: playlist.Owner?.Name ?? string.Empty,
            Tracks: tracks
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