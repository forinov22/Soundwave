namespace Soundwave.Api.Entities;

public class Playlist
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string? ImageS3Path { get; set; }

    // Системный плейлист «Любимые треки».
    // Создаётся автоматически при регистрации пользователя.
    // Нельзя удалить, переименовать или изменить обложку.
    public bool IsLikedSongs { get; set; } = false;

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    // Инвариант: только опубликованные треки.
    // При архивации релиза треки убираются через ReleaseService.DeleteAsync.
    public ICollection<PlaylistTrack> PlaylistTracks { get; set; } = [];
}

// Связующая сущность для порядка треков в плейлисте.
// Порядок важен — пользователь может переставлять треки.
public class PlaylistTrack
{
    public int PlaylistId { get; set; }
    public Playlist Playlist { get; set; } = null!;

    public int TrackId { get; set; }
    public Track Track { get; set; } = null!;

    // Позиция трека в плейлисте (1..N).
    public int Position { get; set; }

    // Когда добавлен — для сортировки "недавно добавленные".
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}