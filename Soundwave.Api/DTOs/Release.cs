namespace Soundwave.Api.DTOs;

// Тип релиза. Вычисляется из количества треков, не хранится.
public enum ReleaseType
{
    Single = 1,
    EP = 2,
    Album = 3,
}

// Лёгкий DTO для витрин (главная, поиск, список релизов артиста на превью).
// Без треков. Содержит TrackCount, чтобы клиент мог показать "Album · 12 треков"
// без отдельного запроса.
public record ReleaseDto(
    int Id,
    string Title,
    string? Description,
    string? ImageUrl,
    string BgColor,
    string Status,        // "Draft" | "Published" | "Archived"
    string Type,          // "Single" | "EP" | "Album"
    DateTime? ReleaseDate,
    DateTime? PublishedAt,
    int TrackCount,
    int ArtistId,
    string ArtistName
);

// Детальный DTO с треками — для страницы релиза слушателя
// и для редактора артиста. Треки идут в порядке Position.
public record ReleaseDetailsDto(
    int Id,
    string Title,
    string? Description,
    string? ImageUrl,
    string BgColor,
    string Status,
    string Type,
    DateTime? ReleaseDate,
    DateTime? PublishedAt,
    int ArtistId,
    string ArtistName,
    IReadOnlyList<TrackDto> Tracks
);

// ── Запросы ────────────────────────────────────────────────────────────────

// Создание черновика. Обложка опциональна — у сингла унаследуется от трека.
public record CreateReleaseRequest(
    string Title,
    string? Description,
    DateTime? ReleaseDate,
    IFormFile? Image
);

// Обновление метаданных черновика. Все поля опциональны —
// передаём только то, что меняется. PATCH-семантика.
public record UpdateReleaseRequest(
    string? Title,
    string? Description,
    DateTime? ReleaseDate,
    IFormFile? Image
);

// Добавление трека в релиз — id трека из плейграунда.
public record AddTrackToReleaseRequest(int TrackId);

// Реордер: новый порядок trackId сверху вниз.
public record ReorderTracksRequest(IList<int> TrackIds);