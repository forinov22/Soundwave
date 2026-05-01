using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface IArtistService
{
    Task<Artist?> GetArtistByIdAsync(int id);

    // Треки и альбомы конкретного артиста
    Task<IEnumerable<Track>> GetArtistTracksAsync(int artistId);
    Task<IEnumerable<Album>> GetArtistAlbumsAsync(int artistId);
    
    // Создание трека — принимает стримы файлов, возвращает созданный трек
    Task<Track> CreateTrackAsync(
        int artistId,
        string title,
        int? albumId,
        Stream audioStream,
        string audioFileName,
        string audioContentType,
        Stream imageStream,
        string imageFileName,
        string imageContentType);
 
    // Создание альбома — без треков, треки добавляются отдельно
    Task<Album> CreateAlbumAsync(
        int artistId,
        string title,
        string description,
        DateTime releaseDate,
        Stream imageStream,
        string imageFileName,
        string imageContentType);
}
