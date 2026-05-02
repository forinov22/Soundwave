namespace Soundwave.Api.DTOs;

public record ArtistDetailsDto(
    int Id,
    string Name,
    string? AvatarUrl,
    string? BannerUrl,      // BackgroundImage — баннер на странице артиста
    string? Description,
    long MonthlyListeners
);
