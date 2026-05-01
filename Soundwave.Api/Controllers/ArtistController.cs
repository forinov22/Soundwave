using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistController : ControllerBase
{
    private readonly IArtistService _artistService;
    private readonly IStorageService _storageService;

    public ArtistController(IArtistService artistService, IStorageService storageService)
    {
        _artistService = artistService;
        _storageService = storageService;
    }

    // GET /api/artist/{id} — публичный профиль артиста
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetInfo(int id)
    {
        var artist = await _artistService.GetArtistByIdAsync(id);
        
        if (artist == null) 
            return NotFound(new { message = "Артист не найден" });

        return Ok(artist.ToDto(_storageService));
    }
    
    // GET /api/artist/me/tracks — треки авторизованного артиста
    [Authorize]
    [HttpGet("me/tracks")]
    public async Task<IActionResult> GetMyTracks()
    {
        var artistId = GetArtistId();
        if (artistId is null) return Unauthorized();
 
        var tracks = await _artistService.GetArtistTracksAsync(artistId.Value);
        return Ok(tracks.Select(t => t.ToDto(_storageService)));
    }
 
    // GET /api/artist/me/albums — альбомы авторизованного артиста
    [Authorize]
    [HttpGet("me/albums")]
    public async Task<IActionResult> GetMyAlbums()
    {
        var artistId = GetArtistId();
        if (artistId is null) return Unauthorized();
 
        var albums = await _artistService.GetArtistAlbumsAsync(artistId.Value);
        return Ok(albums.Select(a => a.ToDto(_storageService)));
    }

    // ── helpers ──────────────────────────────────────────────────────────────
 
    private int? GetArtistId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : null;
    }
}