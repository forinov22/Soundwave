namespace Soundwave.Api.Entities;

public class ListenEvent
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TrackId { get; set; }
    public DateTime ListenedAt { get; set; } = DateTime.UtcNow;

    public Track Track { get; set; } = null!;
}
