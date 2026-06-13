using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LikesController : BaseApiController
{
    private readonly ILikesService _likes;
    private readonly IStorageService _storage;

    public LikesController(ILikesService likes, IStorageService storage)
    {
        _likes = likes;
        _storage = storage;
    }

    // ── Релизы ────────────────────────────────────────────────────────────────

    // GET /api/likes/releases/me — лайкнутые релизы для сайдбара
    [HttpGet("releases/me")]
    public async Task<IActionResult> GetLikedReleases()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var releases = await _likes.GetLikedReleasesAsync(userId);
        return Ok(releases.Select(r => r.ToDto(_storage)));
    }

    // POST /api/likes/releases/{id} — toggle лайк
    [HttpPost("releases/{id:int}")]
    public async Task<IActionResult> ToggleLikeRelease(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var liked = await _likes.ToggleLikeReleaseAsync(userId, id);
        return Ok(new { liked });
    }

    // GET /api/likes/releases/{id} — проверить лайк
    [HttpGet("releases/{id:int}")]
    public async Task<IActionResult> IsReleaseLiked(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var liked = await _likes.IsReleaseLikedAsync(userId, id);
        return Ok(new { liked });
    }

    // ── Артисты ───────────────────────────────────────────────────────────────

    // GET /api/likes/artists/me — подписки для сайдбара
    [HttpGet("artists/me")]
    public async Task<IActionResult> GetFollowedArtists()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var artists = await _likes.GetFollowedArtistsAsync(userId);
        return Ok(artists.Select(a => a.ToDto(_storage)));
    }

    // POST /api/likes/artists/{id} — toggle подписку
    [HttpPost("artists/{id:int}")]
    public async Task<IActionResult> ToggleFollowArtist(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var followed = await _likes.ToggleFollowArtistAsync(userId, id);
        return Ok(new { followed });
    }

    // GET /api/likes/artists/{id} — проверить подписку
    [HttpGet("artists/{id:int}")]
    public async Task<IActionResult> IsArtistFollowed(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var followed = await _likes.IsArtistFollowedAsync(userId, id);
        return Ok(new { followed });
    }

    // ── Плейлисты ─────────────────────────────────────────────────────────────

    // GET /api/likes/playlists/me — сохранённые чужие плейлисты
    [HttpGet("playlists/me")]
    public async Task<IActionResult> GetSavedPlaylists()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var playlists = await _likes.GetSavedPlaylistsAsync(userId);
        return Ok(playlists.Select(p => p.ToSummaryDto(_storage)));
    }

    // POST /api/likes/playlists/{id} — toggle сохранение
    [HttpPost("playlists/{id:int}")]
    public async Task<IActionResult> ToggleSavePlaylist(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var saved = await _likes.ToggleSavePlaylistAsync(userId, id);
        return Ok(new { saved });
    }

    // GET /api/likes/playlists/{id} — проверить сохранение
    [HttpGet("playlists/{id:int}")]
    public async Task<IActionResult> IsPlaylistSaved(int id)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var saved = await _likes.IsPlaylistSavedAsync(userId, id);
        return Ok(new { saved });
    }
}
