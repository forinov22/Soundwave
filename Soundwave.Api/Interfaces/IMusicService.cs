using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface IMusicService
{
    Task<IEnumerable<Track>> GetTrendingTracksAsync();
    Task<IEnumerable<Album>> GetPopularAlbumsAsync();
    Task<Album?> GetAlbumByIdAsync(int id);
}