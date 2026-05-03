using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;
using Soundwave.Api.Services;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistsController : BaseApiController
{
    private readonly IPlaylistService _playlists;
    private readonly IStorageService _storage;

    public PlaylistsController(
        IPlaylistService playlists,
        IStorageService storage)
    {
        _playlists = playlists;
        _storage = storage;
    }

    // GET /api/playlists/me — мои плейлисты (для сайдбара)
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var playlists = await _playlists.GetUserPlaylistsAsync(userId);
        return Ok(playlists.Select(p => p.ToSummaryDto(_storage)));
    }

    // GET /api/playlists/{id} — детали плейлиста с треками
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var playlist = await _playlists.GetByIdAsync(id, userId);

        if (playlist is null) return NotFound();
        return Ok(playlist.ToDetailsDto(_storage));
    }

    // POST /api/playlists — создать плейлист
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var playlist = await _playlists.CreateAsync(userId, request.Title);
        return CreatedAtAction(nameof(GetById), new { id = playlist.Id },
            playlist.ToSummaryDto(_storage));
    }

    // PATCH /api/playlists/{id} — обновить метаданные
    [Authorize]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdatePlaylistRequest request)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        Stream? imageStream = null;
        string? imageName = null, imageType = null;

        if (request.Image is not null)
        {
            imageStream = request.Image.OpenReadStream();
            imageName = request.Image.FileName;
            imageType = request.Image.ContentType;
        }

        try
        {
            var updated = await _playlists.UpdateAsync(
                id, userId,
                request.Title, request.Description, request.IsPublic,
                imageStream, imageName, imageType);

            return Ok(updated.ToDetailsDto(_storage));
        }
        finally
        {
            imageStream?.Dispose();
        }
    }

    // DELETE /api/playlists/{id}
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        await _playlists.DeleteAsync(id, userId);
        return NoContent();
    }

    // POST /api/playlists/{id}/tracks — добавить трек
    [Authorize]
    [HttpPost("{id:int}/tracks")]
    public async Task<IActionResult> AddTrack(int id, [FromBody] AddTrackRequest request)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        await _playlists.AddTrackAsync(id, userId, request.TrackId);
        var updated = await _playlists.GetByIdAsync(id, userId);
        return Ok(updated!.ToDetailsDto(_storage));
    }

    // DELETE /api/playlists/{id}/tracks/{trackId}
    [Authorize]
    [HttpDelete("{id:int}/tracks/{trackId:int}")]
    public async Task<IActionResult> RemoveTrack(int id, int trackId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        await _playlists.RemoveTrackAsync(id, userId, trackId);
        var updated = await _playlists.GetByIdAsync(id, userId);
        return Ok(updated!.ToDetailsDto(_storage));
    }

    // POST /api/playlists/tracks/{trackId}/like — лайк/анлайк
    [Authorize]
    [HttpPost("tracks/{trackId:int}/like")]
    public async Task<IActionResult> ToggleLike(int trackId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var isLiked = await _playlists.ToggleLikeAsync(userId, trackId);
        return Ok(new { liked = isLiked });
    }

    // GET /api/playlists/tracks/{trackId}/like — проверить лайкнут ли
    [Authorize]
    [HttpGet("tracks/{trackId:int}/like")]
    public async Task<IActionResult> IsLiked(int trackId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var liked = await _playlists.IsLikedAsync(userId, trackId);
        return Ok(new { liked });
    }
}