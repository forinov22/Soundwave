using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TracksController : ControllerBase
{
    private readonly IMusicService _musicService;
    private readonly IStorageService _storageService;
    private readonly IArtistService _artistService;

    public TracksController(
        IMusicService musicService,
        IStorageService storageService,
        IArtistService artistService)
    {
        _musicService = musicService;
        _storageService = storageService;
        _artistService = artistService;
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending()
    {
        var tracks = await _musicService.GetTrendingTracksAsync();
        return Ok(tracks.Select(t => t.ToDto(_storageService)));
    }

    // multipart/form-data: title, albumId (optional), audio (file), image (file)
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateTrackRequest request)
    {
        var artistIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (artistIdClaim is null || !int.TryParse(artistIdClaim, out var artistId))
            return Unauthorized();
 
        if (request.Audio is null || request.Image is null)
            return BadRequest(new { message = "Аудиофайл и обложка обязательны" });
 
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { message = "Название обязательно" });
 
        await using var audioStream = request.Audio.OpenReadStream();
        await using var imageStream = request.Image.OpenReadStream();
 
        var track = await _artistService.CreateTrackAsync(
            artistId:         artistId,
            title:            request.Title,
            albumId:          request.AlbumId,
            audioStream:      audioStream,
            audioFileName:    request.Audio.FileName,
            audioContentType: request.Audio.ContentType,
            imageStream:      imageStream,
            imageFileName:    request.Image.FileName,
            imageContentType: request.Image.ContentType);
 
        return CreatedAtAction(nameof(GetTrending), new { id = track.Id },
            track.ToDto(_storageService));
    }
}