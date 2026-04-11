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
        return await _context.Tracks
            .Include(t => t.Artist)
            .OrderByDescending(t => t.PlayCount)
            .Take(10)
            .ToListAsync();
    }

    public async Task<IEnumerable<Album>> GetPopularAlbumsAsync()
    {
        return await _context.Albums
            .Include(a => a.Artist)
            .Take(6)
            .ToListAsync();
    }

    public async Task<Album?> GetAlbumByIdAsync(int id)
    {
        return await _context.Albums
            .Include(a => a.Artist)
            .Include(a => a.Tracks)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
}
