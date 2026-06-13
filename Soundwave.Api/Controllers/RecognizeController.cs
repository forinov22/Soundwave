using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;
using Soundwave.Api.Services;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecognizeController : ControllerBase
{
    private readonly MlServiceClient _ml;
    private readonly IMusicService _music;
    private readonly IStorageService _storage;

    public RecognizeController(
        MlServiceClient ml,
        IMusicService music,
        IStorageService storage)
    {
        _ml = ml;
        _music = music;
        _storage = storage;
    }

    // POST /api/recognize
    // multipart/form-data: audio (файл)
    [HttpPost]
    public async Task<IActionResult> Recognize(IFormFile audio)
    {
        if (audio is null || audio.Length == 0)
            return BadRequest(new { message = "Аудиофайл обязателен" });

        await using var stream = audio.OpenReadStream();
        var mlResult = await _ml.RecognizeAsync(stream, audio.FileName, audio.ContentType);

        if (mlResult is null || mlResult.Candidates.Count == 0)
            return Ok(new RecognizeResponse(false, null, []));

        // Берём топ-3 кандидата, дотягиваем треки из БД
        var topCandidates = mlResult.Candidates
            .OrderByDescending(c => c.AlignmentFraction)
            .Take(3)
            .ToList();

        var trackIds = topCandidates
            .Select(c => int.TryParse(c.TrackId, out var id) ? id : 0)
            .Where(id => id > 0)
            .ToList();

        var tracks = await _music.GetTracksByIdsAsync(trackIds);
        var trackMap = tracks.ToDictionary(t => t.Id);

        var candidateDtos = topCandidates
            .Where(c => int.TryParse(c.TrackId, out var id) && trackMap.ContainsKey(id))
            .Select(c => trackMap[int.Parse(c.TrackId)].ToDto(_storage))
            .ToList();

        var bestMatch = mlResult.Confident && candidateDtos.Count > 0
            ? candidateDtos[0]
            : null;

        return Ok(new RecognizeResponse(mlResult.Confident, bestMatch, candidateDtos));
    }
}