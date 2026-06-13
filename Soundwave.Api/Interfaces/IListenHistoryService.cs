using Soundwave.Api.DTOs;

namespace Soundwave.Api.Interfaces;

public interface IListenHistoryService
{
    Task RecordListenAsync(int userId, int trackId);
    Task<IEnumerable<ListenHistoryItemDto>> GetUserHistoryAsync(int userId, int limit = 20);
    Task<IEnumerable<ListenHistoryItemDto>> GetRecommendationsAsync(int userId, int limit = 10);
    Task<ArtistStatsDto> GetArtistStatsAsync(int artistId);
}
