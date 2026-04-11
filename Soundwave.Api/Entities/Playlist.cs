namespace Soundwave.Api.Entities;

public class Playlist
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string ImageS3Path { get; set; } = string.Empty;

    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<Track> Tracks { get; set; } = [];
}