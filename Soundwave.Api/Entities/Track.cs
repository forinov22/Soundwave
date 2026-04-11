namespace Soundwave.Api.Entities;

public class Track
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AudioS3Path { get; set; } = string.Empty;
    public string ImageS3Path { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public long PlayCount { get; set; }
    
    public int ArtistId { get; set; }
    public User Artist { get; set; } = null!;
    
    public int? AlbumId { get; set; }
    public Album? Album { get; set; }
}