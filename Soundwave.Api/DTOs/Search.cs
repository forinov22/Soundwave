namespace Soundwave.Api.DTOs;

// Единый ответ поиска — всё в одном объекте.
// Каждая секция содержит топ-N результатов.
// Если type задан — заполнена только нужная секция, остальные пусты.
public record SearchResultDto(
    SearchTrackDto?           TopResult,      // лучший общий результат (первый из всех)
    IReadOnlyList<TrackDto>   Tracks,
    IReadOnlyList<ReleaseDto> Releases,
    IReadOnlyList<ArtistSearchDto> Artists,
    IReadOnlyList<PlaylistSearchDto> Playlists
);

public record ArtistSearchDto(
    int    Id,
    string Name,
    string? AvatarUrl
);

public record PlaylistSearchDto(
    int    Id,
    string Title,
    string? ImageUrl,
    string OwnerName
);

// TopResult с дополнительным полем Type для бейджа
public record SearchTrackDto(
    int    Id,
    string Title,
    string? ImageUrl,
    string ArtistName,
    string Type   // "Track" | "Release" | "Artist" | "Playlist"
);