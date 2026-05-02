namespace Soundwave.Api.Entities;

// Связующая many-to-many. Composite PK (ReleaseId, TrackId)
// настраивается в OnModelCreating. Position — порядок трека в релизе, 1..N.
public class ReleaseTrack
{
    public int ReleaseId { get; set; }
    public Release Release { get; set; } = null!;
 
    public int TrackId { get; set; }
    public Track Track { get; set; } = null!;
 
    public int Position { get; set; }
}
