namespace Soundwave.Api.Entities;

public enum ReleaseStatus
{
    Draft = 0,
    Published = 10,
    Archived = 20,
}

public class Release
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // null допустим для черновика и для сингла, который наследует обложку у трека.
    // На публикации EP/Album наличие обложки проверяется в сервисе.
    public string? ImageS3Path { get; set; }
    public string BgColor { get; set; } = "#121212";

    public ReleaseStatus Status { get; set; } = ReleaseStatus.Draft;

    // Дата релиза, как её видит слушатель. Заполняется при публикации
    // (или может быть выставлена раньше — например, артист хочет проставить
    // дату записи). До публикации может быть null.
    public DateTime? ReleaseDate { get; set; }

    // Когда фактически нажали Publish — для аудита и сортировки.
    public DateTime? PublishedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int ArtistId { get; set; }
    public Artist Artist { get; set; } = null!;

    public ICollection<ReleaseTrack> ReleaseTracks { get; set; } = [];
}