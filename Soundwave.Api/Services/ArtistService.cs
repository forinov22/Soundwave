using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class ArtistService : IArtistService
{
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;

    public ArtistService(AppDbContext context, IStorageService storage)
    {
        _context = context;
        _storage = storage;
    }

    public async Task<Artist?> GetArtistByIdAsync(int id)
    {
        return await _context.Users
            .OfType<Artist>()
            .Include(a => a.Tracks)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<Track>> GetArtistTracksAsync(int artistId)
    {
        return await _context.Tracks
            .Include(t => t.Artist)
            .Include(t => t.Album)
            .Where(t => t.ArtistId == artistId)
            .OrderByDescending(t => t.Id)
            .ToListAsync();
    }
 
    public async Task<IEnumerable<Album>> GetArtistAlbumsAsync(int artistId)
    {
        return await _context.Albums
            .Include(a => a.Tracks)
            .Where(a => a.ArtistId == artistId)
            .OrderByDescending(a => a.ReleaseDate)
            .ToListAsync();
    }
    
    public async Task<Track> CreateTrackAsync(
        int artistId,
        string title,
        int? albumId,
        Stream audioStream,
        string audioFileName,
        string audioContentType,
        Stream imageStream,
        string imageFileName,
        string imageContentType)
    {
        // Загружаем файлы в S3 параллельно
        var (audioKey, imageKey) = await UploadBothAsync(
            audioStream, audioFileName, audioContentType, "audio",
            imageStream, imageFileName, imageContentType, "images/tracks");
 
        var track = new Track
        {
            Title         = title,
            ArtistId      = artistId,
            AlbumId       = albumId,
            AudioS3Path   = audioKey,
            ImageS3Path   = imageKey,
            // DurationSeconds можно парсить из аудио; пока 0, потом заменить
            DurationSeconds = 0,
        };
 
        _context.Tracks.Add(track);
        await _context.SaveChangesAsync();
        return track;
    }
 
    public async Task<Album> CreateAlbumAsync(
        int artistId,
        string title,
        string description,
        DateTime releaseDate,
        Stream imageStream,
        string imageFileName,
        string imageContentType)
    {
        var imageKey = await _storage.UploadFileAsync(
            imageStream, imageFileName, imageContentType, "images/albums");
 
        var album = new Album
        {
            Title       = title,
            Description = description,
            ReleaseDate = releaseDate,
            ArtistId    = artistId,
            ImageS3Path = imageKey,
        };
 
        _context.Albums.Add(album);
        await _context.SaveChangesAsync();
        return album;
    }
 
    // ── helpers ──────────────────────────────────────────────────────────────
 
    private async Task<(string audio, string image)> UploadBothAsync(
        Stream audioStream, string audioName, string audioType, string audioFolder,
        Stream imageStream, string imageName, string imageType, string imageFolder)
    {
        var audioTask = _storage.UploadFileAsync(audioStream, audioName, audioType, audioFolder);
        var imageTask = _storage.UploadFileAsync(imageStream, imageName, imageType, imageFolder);
        await Task.WhenAll(audioTask, imageTask);
        return (audioTask.Result, imageTask.Result);
    }
}
