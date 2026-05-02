using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistController : BaseApiController
{
    private readonly IArtistService _artistService;
    private readonly IMusicService _musicService;
    private readonly IStorageService _storageService;

    public ArtistController(
        IArtistService artistService,
        IMusicService musicService,
        IStorageService storageService)
    {
        _artistService = artistService;
        _musicService = musicService;
        _storageService = storageService;
    }

    // GET /api/artist/{id} — публичный профиль артиста.
    // Эндпоинты me/tracks и me/albums уехали:
    //   - me/tracks    → GET /api/tracks/me   (плейграунд с инфой о релизах)
    //   - me/albums    → GET /api/releases/me/drafts | /me/published
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetInfo(int id)
    {
        var artist = await _artistService.GetArtistByIdAsync(id);

        if (artist == null)
            return NotFound(new { message = "Артист не найден" });

        return Ok(artist.ToDto(_storageService));
    }
    
    // GET /api/artist/{id}/tracks/popular?limit=5
    // Топ треков артиста по PlayCount, только из опубликованных релизов.
    [HttpGet("{id:int}/tracks/popular")]
    public async Task<IActionResult> GetPopularTracks(int id, [FromQuery] int limit = 5)
    {
        var artist = await _artistService.GetArtistByIdAsync(id);
        if (artist == null)
            return NotFound(new { message = "Артист не найден" });
 
        var tracks = await _musicService.GetArtistPopularTracksAsync(id, limit);
        return Ok(tracks.Select(t => t.ToDto(_storageService)));
    }
 
    // GET /api/artist/{id}/releases?type=&page=1&pageSize=10
    // Публичные релизы артиста (только Published).
    // type: "" | "Single" | "EP" | "Album"
    [HttpGet("{id:int}/releases")]
    public async Task<IActionResult> GetReleases(
        int id,
        [FromQuery] string? type = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var artist = await _artistService.GetArtistByIdAsync(id);
        if (artist == null)
            return NotFound(new { message = "Артист не найден" });
 
        var (releases, totalCount) = await _musicService.GetArtistReleasesAsync(
            id, type, page, pageSize);
 
        // ToDetailsDto включает треки — они уже загружены через Include в MusicService
        var result = PaginatedResult<ReleaseDetailsDto>.From(
            releases.Select(r => r.ToDetailsDto(_storageService)),
            totalCount,
            page,
            pageSize);
 
        return Ok(result);
    }
}