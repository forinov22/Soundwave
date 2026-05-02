using Soundwave.Api.Entities;

namespace Soundwave.Api.Interfaces;

public interface IMusicService
{
    // Только треки, входящие хотя бы в один опубликованный релиз.
    Task<IEnumerable<Track>> GetTrendingTracksAsync();

    // Витрина опубликованных релизов. Без треков — на главной они не нужны.
    Task<IEnumerable<Release>> GetPopularReleasesAsync();

    // Мета опубликованного релиза для страницы релиза. Без треков —
    // фронт грузит их отдельным запросом, чтобы не блокировать рендер шапки.
    Task<Release?> GetReleaseMetaByIdAsync(int id);

    // Треки опубликованного релиза, в порядке Position.
    // Возвращает null, если релиз не существует или не опубликован —
    // контроллер маппит это в 404.
    Task<IEnumerable<ReleaseTrack>?> GetReleaseTracksAsync(int releaseId);
    
    // Публичная страница артиста
    Task<IEnumerable<Track>> GetArtistPopularTracksAsync(int artistId, int limit = 5);
 
    // Релизы артиста с фильтром по типу и пагинацией.
    // type: null | "Single" | "EP" | "Album" (вычисляется из кол-ва треков)
    Task<(IEnumerable<Release> releases, int totalCount)> GetArtistReleasesAsync(
        int artistId,
        string? type,
        int page,
        int pageSize);
}