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
}