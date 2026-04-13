using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumsController : ControllerBase
{
    private readonly IMusicService _musicService;
    private readonly IStorageService _storageService;

    public AlbumsController(IMusicService musicService, IStorageService storageService)
    {
        _musicService = musicService;
        _storageService = storageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPopular()
    {
        var albums = await _musicService.GetPopularAlbumsAsync();
        return Ok(albums.Select(a => a.ToDto(_storageService)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var album = await _musicService.GetAlbumByIdAsync(id);
        if (album == null) return NotFound();
        
        return Ok(album.ToDto(_storageService));
    }
}