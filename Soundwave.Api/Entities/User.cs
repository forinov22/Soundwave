namespace Soundwave.Api.Entities;

public enum UserRole
{
    Listener = 1,
    Artist = 10,
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Avatar { get; set; } // Маленькая аватарка
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Listener;

    // Связи общие для всех
    public ICollection<Playlist> Playlists { get; set; } = [];
    public ICollection<Track> LikedTracks { get; set; } = [];
}

public class Artist : User
{
    // Поля только для артиста
    public string? BackgroundImage { get; set; } // Та самая картинка профиля (Banner)
    public string? Description { get; set; }
    
    // Навигационные свойства
    public ICollection<Track> Tracks { get; set; } = [];
    public ICollection<Album> Albums { get; set; } = [];
}
