namespace Soundwave.Api.DTOs;

// Краткий DTO для списка в сайдбаре.
public record PlaylistSummaryDto(
    int Id,
    string Title,
    string? ImageUrl,
    int TrackCount,
    bool IsLikedSongs,
    bool IsPublic
);

// Детальный DTO с треками для страницы плейлиста.
public record PlaylistDetailsDto(
    int Id,
    string Title,
    string Description,
    string? ImageUrl,
    bool IsPublic,
    bool IsLikedSongs,
    int OwnerId,
    string OwnerName,
    IReadOnlyList<PlaylistTrackDto> Tracks
);

public record PlaylistTrackDto(
    int Id,
    string Title,
    string AudioUrl,
    string ImageUrl,
    int DurationSeconds,
    string ArtistName,
    int ArtistId,
    string? AlbumTitle,
    DateTime AddedAt,
    long PlayCount
);

// ── Запросы ───────────────────────────────────────────────────────────────────

public record CreatePlaylistRequest(string? Title);   // null → "Мой плейлист №N"

public record UpdatePlaylistRequest(
    string? Title,
    string? Description,
    bool? IsPublic,
    IFormFile? Image
);

public record AddTrackRequest(int TrackId);