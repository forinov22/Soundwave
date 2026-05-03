using Soundwave.Api.Entities;

namespace Soundwave.Api.Services;

public interface IPlaylistService
{
    Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(int userId);
    Task<Playlist?> GetByIdAsync(int playlistId, int? requestingUserId);
    Task<Playlist?> GetLikedSongsPlaylistAsync(int userId);
    Task<Playlist> CreateAsync(int userId, string? title = null);
    Task<Playlist> CreateLikedSongsPlaylistAsync(int userId);

    Task<Playlist> UpdateAsync(
        int playlistId,
        int userId,
        string? title,
        string? description,
        bool? isPublic,
        Stream? imageStream,
        string? imageFileName,
        string? imageContentType);

    Task DeleteAsync(int playlistId, int userId);
    Task AddTrackAsync(int playlistId, int userId, int trackId);
    Task RemoveTrackAsync(int playlistId, int userId, int trackId);
    Task<bool> ToggleLikeAsync(int userId, int trackId);
    Task<bool> IsLikedAsync(int userId, int trackId);
}