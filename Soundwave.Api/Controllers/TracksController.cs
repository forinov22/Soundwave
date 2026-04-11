using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Helpers;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TracksController : ControllerBase
{
    private readonly IMusicService _musicService;
    private readonly IStorageService _storageService;

    public TracksController(IMusicService musicService, IStorageService storageService)
    {
        _musicService = musicService;
        _storageService = storageService;
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending()
    {
        var tracks = await _musicService.GetTrendingTracksAsync();
        return Ok(tracks.Select(t => t.ToDto(_storageService)));
    }
}