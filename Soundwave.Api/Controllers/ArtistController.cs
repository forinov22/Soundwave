using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistController : BaseApiController
{
    private readonly IArtistService _artistService;
    private readonly IStorageService _storageService;

    public ArtistController(IArtistService artistService, IStorageService storageService)
    {
        _artistService = artistService;
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
}