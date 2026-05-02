using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Settings;

namespace Soundwave.Api.Controllers;

/// <summary>
/// Внутренние эндпоинты — только для межсервисного взаимодействия.
/// Авторизованы по X-Internal-Token, не по JWT пользователя.
/// </summary>
[ApiController]
[Route("api/internal")]
public class InternalController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly MlServiceOptions _options;
    private readonly ILogger<InternalController> _logger;

    public InternalController(
        AppDbContext context,
        IOptions<MlServiceOptions> options,
        ILogger<InternalController> logger)
    {
        _context = context;
        _options = options.Value;
        _logger = logger;
    }

    public record TrackProcessedCallback(bool Success, string? Error);

    /// <summary>Вызывается Python-сервисом после завершения обработки трека.</summary>
    [HttpPost("tracks/{trackId}/processed")]
    public async Task<IActionResult> TrackProcessed(int trackId, [FromBody] TrackProcessedCallback body)
    {
        // Проверяем internal token
        if (!Request.Headers.TryGetValue("X-Internal-Token", out var token)
            || token != _options.InternalToken)
        {
            return Forbid();
        }

        var track = await _context.Tracks.FindAsync(trackId);
        if (track is null)
        {
            _logger.LogWarning("TrackProcessed callback for unknown track {TrackId}", trackId);
            return NotFound();
        }

        track.ProcessingStatus = body.Success
            ? TrackProcessingStatus.Ready
            : TrackProcessingStatus.Failed;
        track.ProcessingError = body.Error;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Track {TrackId} processing result: success={Success}, error={Error}",
            trackId, body.Success, body.Error);

        return NoContent();
    }
}