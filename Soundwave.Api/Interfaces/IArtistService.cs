using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface IArtistService
{
    Task<Artist?> GetArtistByIdAsync(int id);
}
