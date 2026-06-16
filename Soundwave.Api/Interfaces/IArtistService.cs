using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface IArtistService
{
    Task<Artist?> GetArtistByIdAsync(int id);

    // Все треки артиста (плейграунд + те, что в релизах).
    Task<IEnumerable<Track>> GetArtistTracksAsync(int artistId);

    // Загрузка трека в плейграунд. Без привязки к релизу.
    Task<Track> CreateTrackAsync(
        int artistId,
        string title,
        Stream audioStream,
        string audioFileName,
        string audioContentType,
        Stream imageStream,
        string imageFileName,
        string imageContentType);

    // Удаление трека.
    // - Если трек в опубликованном релизе → ConflictException (никогда нельзя).
    // - Если трек в черновиках и force=false → ConflictException со списком черновиков.
    // - Если force=true → удаляются связи с черновиками, затем сам трек.
    Task DeleteTrackAsync(int trackId, int artistId, bool force);

    Task<Artist> UpdateProfileAsync(
        int artistId,
        string? name,
        string? description,
        Stream? avatarStream,
        string? avatarFileName,
        string? avatarContentType,
        Stream? bannerStream,
        string? bannerFileName,
        string? bannerContentType);
}