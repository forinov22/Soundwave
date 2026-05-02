using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Exceptions;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReleasesController : BaseApiController
{
    private readonly IMusicService _music;
    private readonly IReleaseService _releases;
    private readonly IStorageService _storage;

    public ReleasesController(
        IMusicService music,
        IReleaseService releases,
        IStorageService storage)
    {
        _music = music;
        _releases = releases;
        _storage = storage;
    }

    // ── Публичные витрины (для слушателей) ──────────────────────────────────

    // GET /api/releases — популярные опубликованные релизы (без треков)
    [HttpGet]
    public async Task<IActionResult> GetPopular()
    {
        var releases = await _music.GetPopularReleasesAsync();
        return Ok(releases.Select(r => r.ToDto(_storage)));
    }

    // GET /api/releases/{id} — мета релиза (без треков, только Published).
    // Треки клиент дотягивает отдельным запросом.
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetMeta(int id)
    {
        var release = await _music.GetReleaseMetaByIdAsync(id);
        if (release is null) return NotFound();
        return Ok(release.ToDto(_storage));
    }

    // GET /api/releases/{id}/tracks — треки опубликованного релиза.
    [HttpGet("{id:int}/tracks")]
    public async Task<IActionResult> GetTracks(int id)
    {
        var tracks = await _music.GetReleaseTracksAsync(id);
        if (tracks is null) return NotFound();

        var ordered = tracks.OrderBy(rt => rt.Position).Select(rt => rt.Track.ToDto(_storage));
        return Ok(ordered);
    }

    // ── Артистская часть ────────────────────────────────────────────────────

    // GET /api/releases/me/drafts — мои черновики, с треками
    [Authorize]
    [HttpGet("me/drafts")]
    public async Task<IActionResult> GetMyDrafts()
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        var drafts = await _releases.GetMyDraftsAsync(artistId);
        return Ok(drafts.Select(r => r.ToDetailsDto(_storage)));
    }

    // GET /api/releases/me/published — мои опубликованные и архивные, с треками
    [Authorize]
    [HttpGet("me/published")]
    public async Task<IActionResult> GetMyPublished()
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        var published = await _releases.GetMyPublishedAsync(artistId);
        return Ok(published.Select(r => r.ToDetailsDto(_storage)));
    }

    // GET /api/releases/me/{id} — детальный просмотр своего релиза для редактора
    [Authorize]
    [HttpGet("me/{id:int}")]
    public async Task<IActionResult> GetMyById(int id)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        var release = await _releases.GetByIdWithTracksAsync(id);
        if (release is null) return NotFound();
        if (release.ArtistId != artistId) return Forbid();

        return Ok(release.ToDetailsDto(_storage));
    }

    // POST /api/releases — создать черновик
    // multipart/form-data: title, description?, releaseDate?, image?
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateReleaseRequest request)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ValidationException("Название обязательно");

        Stream? imageStream = null;
        string? imageName = null;
        string? imageType = null;
        if (request.Image is not null)
        {
            imageStream = request.Image.OpenReadStream();
            imageName = request.Image.FileName;
            imageType = request.Image.ContentType;
        }

        try
        {
            var release = await _releases.CreateDraftAsync(
                artistId: artistId,
                title: request.Title,
                description: request.Description,
                releaseDate: request.ReleaseDate,
                imageStream: imageStream,
                imageFileName: imageName,
                imageContentType: imageType);

            return CreatedAtAction(nameof(GetMyById), new { id = release.Id },
                release.ToDetailsDto(_storage));
        }
        finally
        {
            imageStream?.Dispose();
        }
    }

    // PATCH /api/releases/{id} — обновить мету черновика
    [Authorize]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateReleaseRequest request)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        Stream? imageStream = null;
        string? imageName = null;
        string? imageType = null;
        if (request.Image is not null)
        {
            imageStream = request.Image.OpenReadStream();
            imageName = request.Image.FileName;
            imageType = request.Image.ContentType;
        }

        try
        {
            var updated = await _releases.UpdateDraftAsync(
                releaseId: id,
                artistId: artistId,
                title: request.Title,
                description: request.Description,
                releaseDate: request.ReleaseDate,
                imageStream: imageStream,
                imageFileName: imageName,
                imageContentType: imageType);

            return Ok(updated.ToDetailsDto(_storage));
        }
        finally
        {
            imageStream?.Dispose();
        }
    }

    // ── Состав треков в релизе ─────────────────────────────────────────────

    // POST /api/releases/{id}/tracks — добавить трек по id
    [Authorize]
    [HttpPost("{id:int}/tracks")]
    public async Task<IActionResult> AddTrack(int id, [FromBody] AddTrackToReleaseRequest request)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        await _releases.AddTrackAsync(id, artistId, request.TrackId);

        // Возвращаем обновлённый детальный DTO — фронту не нужно делать
        // отдельный запрос, чтобы перерисовать релиз после добавления.
        var updated = await _releases.GetByIdWithTracksAsync(id);
        return Ok(updated!.ToDetailsDto(_storage));
    }

    // DELETE /api/releases/{id}/tracks/{trackId} — убрать трек из релиза
    [Authorize]
    [HttpDelete("{id:int}/tracks/{trackId:int}")]
    public async Task<IActionResult> RemoveTrack(int id, int trackId)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        await _releases.RemoveTrackAsync(id, artistId, trackId);

        var updated = await _releases.GetByIdWithTracksAsync(id);
        return Ok(updated!.ToDetailsDto(_storage));
    }

    // PUT /api/releases/{id}/tracks/order — задать новый порядок
    [Authorize]
    [HttpPut("{id:int}/tracks/order")]
    public async Task<IActionResult> Reorder(int id, [FromBody] ReorderTracksRequest request)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        await _releases.ReorderTracksAsync(id, artistId, request.TrackIds);

        var updated = await _releases.GetByIdWithTracksAsync(id);
        return Ok(updated!.ToDetailsDto(_storage));
    }

    // ── Публикация и удаление ──────────────────────────────────────────────

    // POST /api/releases/{id}/publish
    [Authorize]
    [HttpPost("{id:int}/publish")]
    public async Task<IActionResult> Publish(int id)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        var published = await _releases.PublishAsync(id, artistId);
        return Ok(published.ToDetailsDto(_storage));
    }

    // DELETE /api/releases/{id}
    //  - Draft  → hard delete
    //  - Published → soft delete (архивация + чистка плейлистов/лайков)
    //  - Archived → no-op
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        await _releases.DeleteAsync(id, artistId);
        return NoContent();
    }
}