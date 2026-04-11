using Soundwave.Api.DTOs;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Helpers;

public static class MappingExtensions
{
    public static TrackDto ToDto(this Track t, IStorageService storage)
    {
        return new TrackDto(
            t.Id,
            t.Title,
            storage.GetPresignedUrl(t.AudioS3Path),
            storage.GetPresignedUrl(t.ImageS3Path),
            t.DurationSeconds,
            t.Artist?.Name ?? "Unknown Artist",
            t.ArtistId
        );
    }

    public static AlbumDto ToDto(this Album a, IStorageService storage)
    {
        return new AlbumDto(
            a.Id,
            a.Title,
            a.Description,
            storage.GetPresignedUrl(a.ImageS3Path),
            a.BgColor,
            a.Tracks.Select(t => t.ToDto(storage)).ToList()
        );
    }
}