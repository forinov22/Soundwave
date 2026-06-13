using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Exceptions;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TracksController : BaseApiController
{
    private readonly IMusicService _music;
    private readonly IArtistService _artist;
    private readonly IStorageService _storage;

    public TracksController(
        IMusicService music,
        IArtistService artist,
        IStorageService storage)
    {
        _music = music;
        _artist = artist;
        _storage = storage;
    }

    // GET /api/tracks/trending — публичная витрина (только из Published-релизов)
    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending()
    {
        var tracks = await _music.GetTrendingTracksAsync();
        return Ok(tracks.Select(t => t.ToDto(_storage)));
    }

    // GET /api/tracks/me — плейграунд: все треки артиста с инфой о релизах
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyPlayground()
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        var tracks = await _artist.GetArtistTracksAsync(artistId);
        return Ok(tracks.Select(t => t.ToArtistDto(_storage)));
    }

    // POST /api/tracks — загрузить трек в плейграунд
    // multipart/form-data: title, audio, image
    // (albumId больше не принимаем — добавление в релиз делается отдельным эндпоинтом)
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateTrackRequest request)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        if (request.Audio is null || request.Image is null)
            throw new ValidationException("Аудиофайл и обложка обязательны");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ValidationException("Название обязательно");

        await using var audioStream = request.Audio.OpenReadStream();
        await using var imageStream = request.Image.OpenReadStream();

        var track = await _artist.CreateTrackAsync(
            artistId: artistId,
            title: request.Title,
            audioStream: audioStream,
            audioFileName: request.Audio.FileName,
            audioContentType: request.Audio.ContentType,
            imageStream: imageStream,
            imageFileName: request.Image.FileName,
            imageContentType: request.Image.ContentType);

        // Свежесозданный трек ещё не входит ни в один релиз —
        // ToArtistDto вернёт пустой Releases, что и нужно фронту.
        return CreatedAtAction(nameof(GetMyPlayground), null,
            track.ToArtistDto(_storage));
    }

    // DELETE /api/tracks/{id}?force=bool — удалить трек из плейграунда
    //
    // Поведение:
    //  - Трек в Published-релизе → 409 (никогда нельзя)
    //  - Трек в драфтах, force=false → 409 со списком драфтов (UI спросит подтверждение)
    //  - Трек в драфтах, force=true → удаляются связи с драфтами + сам трек
    //  - Трек свободен → удаляется сразу
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool force = false)
    {
        if (!TryGetUserId(out var artistId)) return Unauthorized();

        await _artist.DeleteTrackAsync(id, artistId, force);
        return NoContent();
    }
}