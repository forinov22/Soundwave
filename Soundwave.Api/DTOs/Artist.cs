namespace Soundwave.Api.DTOs;

public record ArtistDetailsDto(
    int Id,
    string Name,
    string? ImageUrl,
    string? Description,
    long MonthlyListeners
);
