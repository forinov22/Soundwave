using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Extensions;
using Soundwave.Api.Interfaces;
using Soundwave.Api.Services;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;

    public AdminController(IAuthService authService, AppDbContext context, IStorageService storage)
    {
        _authService = authService;
        _context = context;
        _storage = storage;
    }

    // GET /api/admin/artists
    [HttpGet("artists")]
    public async Task<IActionResult> GetArtists()
    {
        var artists = await _context.Users
            .OfType<Artist>()
            .OrderBy(a => a.Name)
            .Select(a => new
            {
                a.Id,
                a.Name,
                a.Email,
                a.Description,
                AvatarUrl = string.IsNullOrEmpty(a.Avatar) ? null : _storage.GetPresignedUrl(a.Avatar),
                TrackCount = a.Tracks.Count,
                ReleaseCount = a.Releases.Count(r => r.Status == ReleaseStatus.Published),
            })
            .ToListAsync();

        return Ok(artists);
    }

    // POST /api/admin/artists
    [HttpPost("artists")]
    public async Task<IActionResult> CreateArtist([FromBody] CreateArtistRequest body)
    {
        if (_authService.GetUserByEmail(body.Email) != null)
            return BadRequest(new { message = "Пользователь с таким email уже существует" });

        var artist = await _authService.CreateArtistAsync(
            body.Email, body.Password, body.Name, body.Description);

        return Ok(new { artist.Id, artist.Name, artist.Email });
    }
}

public record CreateArtistRequest(
    string Name,
    string Email,
    string Password,
    string? Description
);
