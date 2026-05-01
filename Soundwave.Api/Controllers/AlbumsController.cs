using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumsController : ControllerBase
{
    private readonly IMusicService _musicService;
    private readonly IStorageService _storageService;
    private readonly IArtistService _artistService;

    public AlbumsController(
        IMusicService musicService,
        IStorageService storageService,
        IArtistService artistService)
    {
        _musicService = musicService;
        _storageService = storageService;
        _artistService = artistService;
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

    // multipart/form-data: title, description, releaseDate, image (file)
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateAlbumRequest request)
    {
        var artistIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (artistIdClaim is null || !int.TryParse(artistIdClaim, out var artistId))
            return Unauthorized();
 
        if (request.Image is null)
            return BadRequest(new { message = "Обложка обязательна" });
 
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Название обязательно" });
 
        await using var imageStream = request.Image.OpenReadStream();
 
        var album = await _artistService.CreateAlbumAsync(
            artistId:         artistId,
            title:            request.Title,
            description:      request.Description ?? string.Empty,
            releaseDate:      request.ReleaseDate ?? DateTime.UtcNow,
            imageStream:      imageStream,
            imageFileName:    request.Image.FileName,
            imageContentType: request.Image.ContentType);
 
        return CreatedAtAction(nameof(GetById), new { id = album.Id },
            album.ToDto(_storageService));
    }
}