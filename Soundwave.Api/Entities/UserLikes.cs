namespace Soundwave.Api.Entities;

public class UserLikedRelease
{
    public int UserId { get; set; }
    public int ReleaseId { get; set; }
    public DateTime LikedAt { get; set; } = DateTime.UtcNow;
}

public class UserFollowedArtist
{
    public int UserId { get; set; }
    public int ArtistId { get; set; }
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;
}

public class UserSavedPlaylist
{
    public int UserId { get; set; }
    public int PlaylistId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
