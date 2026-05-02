namespace Soundwave.Api.Entities;

public enum TrackProcessingStatus
{
    Pending    = 0,
    Processing = 10,
    Ready      = 20,
    Failed     = 30,
}

public class Track
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AudioS3Path { get; set; } = string.Empty;
    public string ImageS3Path { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public long PlayCount { get; set; }
 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public TrackProcessingStatus ProcessingStatus { get; set; } = TrackProcessingStatus.Pending;
    public string? ProcessingError { get; set; }
 
    public int ArtistId { get; set; }
    public Artist Artist { get; set; } = null!;
 
    // Трек больше не привязан к одному альбому/релизу напрямую.
    // Принадлежность релизам — через ReleaseTracks (M:N).
    public ICollection<ReleaseTrack> ReleaseTracks { get; set; } = [];
}