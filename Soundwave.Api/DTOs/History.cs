namespace Soundwave.Api.DTOs;

public record ListenHistoryItemDto(
    int TrackId,
    string Title,
    string? ImageUrl,
    string AudioUrl,
    int ArtistId,
    string ArtistName,
    int DurationSeconds,
    long PlayCount,
    DateTime ListenedAt
);

public record ArtistStatsDto(
    long TotalPlays,
    int TotalTracks,
    int TotalReleases,
    int Followers,
    IEnumerable<TopTrackDto> TopTracks
);

public record TopTrackDto(
    int Id,
    string Title,
    string? ImageUrl,
    long PlayCount,
    int DurationSeconds
);
