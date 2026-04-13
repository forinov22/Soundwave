using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class ArtistService : IArtistService
{
    private readonly AppDbContext _context;

    public ArtistService(AppDbContext context) => _context = context;

    public async Task<Artist?> GetArtistByIdAsync(int id)
    {
        return await _context.Users
            .OfType<Artist>()
            .Include(a => a.Tracks)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
}
