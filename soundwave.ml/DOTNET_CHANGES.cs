// ============================================================
// ИЗМЕНЕНИЯ В .NET (Soundwave.Api)
// ============================================================
// Добавить эти файлы/изменения в существующий проект.
// ============================================================


// ── 1. Entities/Track.cs — добавить поля статуса ────────────

// В существующую сущность Track добавить:

public enum TrackProcessingStatus
{
    Pending    = 0,
    Processing = 1,
    Ready      = 2,
    Failed     = 3,
}

// В класс Track:
public TrackProcessingStatus ProcessingStatus { get; set; } = TrackProcessingStatus.Pending;
public string? ProcessingError { get; set; }


// ── 2. Services/MlServiceClient.cs — HTTP-клиент к Python ───

using System.Net.Http.Json;

namespace Soundwave.Api.Services;

public class MlServiceClient
{
    private readonly HttpClient _http;
    private readonly string _internalToken;

    public MlServiceClient(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _internalToken = cfg["MlService:InternalToken"] ?? throw new InvalidOperationException("MlService:InternalToken not set");
    }

    /// <summary>Запускает обработку трека на Python-сервисе (fingerprint + embedding).</summary>
    public async Task<bool> StartProcessingAsync(string externalTrackId, string s3Key)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/tracks/{externalTrackId}/process");

        request.Headers.Add("X-Internal-Token", _internalToken);
        request.Content = JsonContent.Create(new { s3_key = s3Key });

        var response = await _http.SendAsync(request);
        return response.IsSuccessStatusCode; // 202
    }

    /// <summary>Удаляет данные трека из Python-сервиса.</summary>
    public async Task DeleteTrackAsync(string externalTrackId)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"/tracks/{externalTrackId}");
        request.Headers.Add("X-Internal-Token", _internalToken);
        await _http.SendAsync(request);
    }
}


// ── 3. Program.cs — регистрация клиента ─────────────────────

// Добавить в Program.cs:

// builder.Services.AddHttpClient<MlServiceClient>(client =>
// {
//     client.BaseAddress = new Uri(builder.Configuration["MlService:BaseUrl"]
//         ?? "http://localhost:8001");
// });


// ── 4. appsettings.json — конфиг ────────────────────────────

// Добавить секцию:
// "MlService": {
//   "BaseUrl": "http://localhost:8001",
//   "InternalToken": "change-me-in-production"
// }


// ── 5. ArtistService.cs — вызов Python после загрузки ───────

// В метод CreateTrackAsync, ПОСЛЕ _context.SaveChangesAsync():

//   // Запускаем асинхронную обработку на ML-сервисе.
//   // Не блокируем артиста — обработка идёт в фоне.
//   // При ошибке связи логируем, но не фейлим запрос (трек уже создан).
//   try
//   {
//       await _mlClient.StartProcessingAsync(
//           externalTrackId: track.Id.ToString(),
//           s3Key: track.AudioS3Path);
//   }
//   catch (Exception ex)
//   {
//       _logger.LogWarning(ex, "Failed to start ML processing for track {TrackId}", track.Id);
//       // Трек создан, но статус останется Pending — можно ретраить через UI
//   }
//
//   return track;


// ── 6. ReleaseService.cs — проверка статуса при публикации ──

// В PublishAsync, в блоке проверки инвариантов, добавить:

//   // Все треки релиза должны быть обработаны ML-сервисом
//   var notReadyTracks = release.ReleaseTracks
//       .Select(rt => rt.Track)
//       .Where(t => t.ProcessingStatus != TrackProcessingStatus.Ready)
//       .ToList();
//
//   if (notReadyTracks.Count > 0)
//   {
//       var statusList = notReadyTracks
//           .Select(t => new { t.Id, t.Title, Status = t.ProcessingStatus.ToString() })
//           .ToList();
//       throw new ConflictException(
//           "Некоторые треки ещё не обработаны. Дождитесь завершения обработки.",
//           new { notReadyTracks = statusList });
//   }


// ── 7. Controllers/InternalController.cs — callback от Python ──

using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;

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
    private readonly IConfiguration _config;
    private readonly ILogger<InternalController> _logger;

    public InternalController(AppDbContext context, IConfiguration config,
        ILogger<InternalController> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    public record TrackProcessedCallback(bool Success, string? Error);

    /// <summary>Вызывается Python-сервисом после завершения обработки трека.</summary>
    [HttpPost("tracks/{trackId}/processed")]
    public async Task<IActionResult> TrackProcessed(int trackId, [FromBody] TrackProcessedCallback body)
    {
        // Проверяем internal token
        if (!Request.Headers.TryGetValue("X-Internal-Token", out var token)
            || token != _config["MlService:InternalToken"])
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


// ── 8. ArtistService.DeleteTrackAsync — удалить из ML ───────

// В методе DeleteTrackAsync, после _context.SaveChangesAsync():

//   try
//   {
//       await _mlClient.DeleteTrackAsync(trackId.ToString());
//   }
//   catch (Exception ex)
//   {
//       _logger.LogWarning(ex, "Failed to delete track {TrackId} from ML service", trackId);
//       // Не фейлим — трек из .NET удалён, ML-сервис почистит при следующей переиндексации
//   }
