namespace Soundwave.Api.Entities;

public class Album
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; }
    public string ImageS3Path { get; set; } = string.Empty;
    public string BgColor { get; set; } = "#121212";
    public DateTime ReleaseDate { get; set; }
    public long PlayCount { get; set; }
    
    public int ArtistId { get; set; }
    public Artist Artist { get; set; } = null!;
    public ICollection<Track> Tracks { get; set; } = [];
}