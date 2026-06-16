using Microsoft.AspNetCore.Http;

namespace Soundwave.Api.DTOs;

public record UpdateArtistProfileRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public IFormFile? Avatar { get; init; }
    public IFormFile? Banner { get; init; }
}

public record ArtistDetailsDto(
    int Id,
    string Name,
    string? AvatarUrl,
    string? BannerUrl,      // BackgroundImage — баннер на странице артиста
    string? Description,
    long MonthlyListeners
);
