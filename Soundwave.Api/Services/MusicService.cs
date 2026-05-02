using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class MusicService : IMusicService
{
    private readonly AppDbContext _context;

    public MusicService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Track>> GetTrendingTracksAsync()
    {
        // Только треки, входящие хотя бы в один опубликованный релиз.
        return await _context.Tracks
            .Include(t => t.Artist)
            .Where(t => t.ReleaseTracks
                .Any(rt => rt.Release.Status == ReleaseStatus.Published))
            .OrderByDescending(t => t.PlayCount)
            .Take(10)
            .ToListAsync();
    }

    public async Task<IEnumerable<Release>> GetPopularReleasesAsync()
    {
        // Витрина: только мета + артист. Треки на главной не нужны,
        // не грузим их.
        return await _context.Releases
            .Include(r => r.Artist)
            .Where(r => r.Status == ReleaseStatus.Published)
            .OrderByDescending(r => r.PublishedAt)
            .Take(6)
            .ToListAsync();
    }

    public Task<Release?> GetReleaseMetaByIdAsync(int id)
    {
        // Шапка страницы релиза. Без треков — фронт догрузит их отдельно.
        return _context.Releases
            .Include(r => r.Artist)
            .FirstOrDefaultAsync(r => r.Id == id && r.Status == ReleaseStatus.Published);
    }

    public async Task<IEnumerable<ReleaseTrack>?> GetReleaseTracksAsync(int releaseId)
    {
        // Сначала проверяем существование и статус — иначе вернём null,
        // и контроллер ответит 404. Это отличает «релиз не существует»
        // от «релиз существует, но треков пока нет».
        var exists = await _context.Releases
            .AnyAsync(r => r.Id == releaseId && r.Status == ReleaseStatus.Published);

        if (!exists) return null;

        return await _context.ReleaseTracks
            .Include(rt => rt.Track)
                .ThenInclude(t => t.Artist)
            .Where(rt => rt.ReleaseId == releaseId)
            .OrderBy(rt => rt.Position)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Track>> GetArtistPopularTracksAsync(int artistId, int limit = 5)
    {
        return await _context.Tracks
            .Include(t => t.Artist)
            .Where(t =>
                t.ArtistId == artistId &&
                t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published))
            .OrderByDescending(t => t.PlayCount)
            .Take(limit)
            .ToListAsync();
    }
 
    public async Task<(IEnumerable<Release> releases, int totalCount)> GetArtistReleasesAsync(
        int artistId,
        string? type,
        int page,
        int pageSize)
    {
        // Базовый запрос: опубликованные релизы артиста с треками
        var query = _context.Releases
            .Include(r => r.ReleaseTracks.OrderBy(rt => rt.Position))
            .ThenInclude(rt => rt.Track)           // ← добавлено: грузим треки
            .ThenInclude(t => t.Artist)        // ← и имя артиста для каждого трека
            .Where(r => r.ArtistId == artistId && r.Status == ReleaseStatus.Published);
 
        // Фильтр по типу — тип вычисляется из кол-ва треков
        if (!string.IsNullOrEmpty(type))
        {
            query = type switch
            {
                "Single" => query.Where(r => r.ReleaseTracks.Count == 1),
                "EP"     => query.Where(r => r.ReleaseTracks.Count >= 2 && r.ReleaseTracks.Count <= 6),
                "Album"  => query.Where(r => r.ReleaseTracks.Count > 6),
                _        => query
            };
        }
 
        var totalCount = await query.CountAsync();
 
        var releases = await query
            .OrderByDescending(r => r.ReleaseDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
 
        return (releases, totalCount);
    }
}