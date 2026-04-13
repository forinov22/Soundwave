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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetInfo(int id)
    {
        var artist = await _artistService.GetArtistByIdAsync(id);
        
        if (artist == null) 
            return NotFound(new { message = "Артист не найден" });

        return Ok(artist.ToDto(_storageService));
    }
}