using System.ComponentModel.DataAnnotations;

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
    public string? Avatar { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Listener;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<Track> Tracks { get; set; } = [];
    public ICollection<Album> Albums { get; set; } = [];
    public ICollection<Playlist> Playlists { get; set; } = [];
    public ICollection<Track> LikedTracks { get; set; } = [];
}