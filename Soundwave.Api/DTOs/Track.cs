namespace Soundwave.Api.DTOs;

public record TrackDto(
    int Id, 
    string Title, 
    string AudioUrl,
    string ImageUrl, 
    int DurationSeconds, 
    string ArtistName,
    int ArtistId
);

public record AlbumDto(
    int Id, 
    string Title, 
    string Description, 
    string ImageUrl, 
    string BgColor,
    List<TrackDto> Tracks
);
