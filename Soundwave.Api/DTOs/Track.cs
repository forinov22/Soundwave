namespace Soundwave.Api.DTOs;

// Публичный DTO трека — для витрин, страницы релиза, плеера слушателя.
public record TrackDto(
    int Id,
    string Title,
    string AudioUrl,
    string ImageUrl,
    int DurationSeconds,
    string ArtistName,
    int ArtistId
);

// Состояние трека в плейграунде артиста — где он сейчас «лежит».
// Используется чтобы UI плейграунда мог показать бейдж статуса
// и решить, можно ли удалить.
public record ArtistTrackDto(
    int Id,
    string Title,
    string AudioUrl,
    string ImageUrl,
    int DurationSeconds,
    string ArtistName,
    int ArtistId,
    DateTime CreatedAt,
    // Релизы, в которых трек состоит. На фронте определяет бейдж:
    //  - пусто → "свободен"
    //  - все Draft → "в черновиках: X, Y"
    //  - есть Published → "опубликован в Z"
    IReadOnlyList<TrackReleaseRefDto> Releases
);

// Краткая ссылка на релиз — id, title, статус. Без треков, без обложки.
public record TrackReleaseRefDto(
    int Id,
    string Title,
    string Status // "Draft" | "Published" | "Archived"
);

public record CreateTrackRequest(
    string Title,
    IFormFile? Audio,
    IFormFile? Image
);