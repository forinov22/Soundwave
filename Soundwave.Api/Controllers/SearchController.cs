using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.Services;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly SearchService _search;

    public SearchController(SearchService search)
    {
        _search = search;
    }

    // GET /api/search?q=eminem&type=Tracks
    // type: All | Tracks | Releases | Artists | Playlists (default: All)
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] string? type = null)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new
            {
                topResult  = (object?)null,
                tracks     = Array.Empty<object>(),
                releases   = Array.Empty<object>(),
                artists    = Array.Empty<object>(),
                playlists  = Array.Empty<object>(),
            });

        var result = await _search.SearchAsync(q, type);
        return Ok(result);
    }
}