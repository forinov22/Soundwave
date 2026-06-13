using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/history")]
[Authorize]
public class ListenHistoryController : BaseApiController
{
    private readonly IListenHistoryService _historyService;

    public ListenHistoryController(IListenHistoryService historyService)
    {
        _historyService = historyService;
    }

    // POST /api/history
    [HttpPost]
    public async Task<IActionResult> RecordListen([FromBody] RecordListenRequest body)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        await _historyService.RecordListenAsync(userId.Value, body.TrackId);
        return Ok();
    }

    // GET /api/history/me?limit=20
    [HttpGet("me")]
    public async Task<IActionResult> GetHistory([FromQuery] int limit = 20)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var history = await _historyService.GetUserHistoryAsync(userId.Value, limit);
        return Ok(history);
    }

    // GET /api/history/recommendations?limit=10
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] int limit = 10)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var recs = await _historyService.GetRecommendationsAsync(userId.Value, limit);
        return Ok(recs);
    }
}

public record RecordListenRequest(int TrackId);
