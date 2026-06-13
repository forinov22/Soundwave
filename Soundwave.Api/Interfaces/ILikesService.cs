using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface ILikesService
{
    // Релизы (альбомы)
    Task<bool> ToggleLikeReleaseAsync(int userId, int releaseId);
    Task<bool> IsReleaseLikedAsync(int userId, int releaseId);
    Task<IEnumerable<Release>> GetLikedReleasesAsync(int userId);

    // Артисты (подписки)
    Task<bool> ToggleFollowArtistAsync(int userId, int artistId);
    Task<bool> IsArtistFollowedAsync(int userId, int artistId);
    Task<IEnumerable<Artist>> GetFollowedArtistsAsync(int userId);

    // Плейлисты (сохранение чужих)
    Task<bool> ToggleSavePlaylistAsync(int userId, int playlistId);
    Task<bool> IsPlaylistSavedAsync(int userId, int playlistId);
    Task<IEnumerable<Playlist>> GetSavedPlaylistsAsync(int userId);
}
