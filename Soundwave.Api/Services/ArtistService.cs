using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Exceptions;
using Soundwave.Api.Helpers;
using Soundwave.Api.Interfaces;

namespace Soundwave.Api.Services;

public class ArtistService : IArtistService
{
    private readonly ILogger<ArtistService> _logger;
    private readonly AppDbContext _context;
    private readonly IStorageService _storage;
    private readonly MlServiceClient _mlClient;

    public ArtistService(
        ILogger<ArtistService> logger,
        AppDbContext context,
        IStorageService storage,
        MlServiceClient mlClient)
    {
        _logger = logger;
        _context = context;
        _storage = storage;
        _mlClient = mlClient;
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
        // Подгружаем ReleaseTracks → Release, чтобы DTO мог показать,
        // в каких релизах состоит трек (статус и название).
        return await _context.Tracks
            .Include(t => t.Artist)
            .Include(t => t.ReleaseTracks)
                .ThenInclude(rt => rt.Release)
            .Where(t => t.ArtistId == artistId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Track> CreateTrackAsync(
        int artistId,
        string title,
        Stream audioStream,
        string audioFileName,
        string audioContentType,
        Stream imageStream,
        string imageFileName,
        string imageContentType)
    {
        // Считаем длину до загрузки в S3 — стрим будет прочитан,
        // поэтому копируем в MemoryStream чтобы потом загрузить.
        var (durationSeconds, audioStreamToUpload) = await ExtractDurationAsync(audioStream);

        try
        {
            var (audioKey, imageKey) = await UploadBothAsync(
                audioStreamToUpload, audioFileName, audioContentType, "audio",
                imageStream, imageFileName, imageContentType, "images/tracks");

            var track = new Track
            {
                Title = title,
                ArtistId = artistId,
                AudioS3Path = audioKey,
                ImageS3Path = imageKey,
                DurationSeconds = durationSeconds,
            };

            _context.Tracks.Add(track);
            await _context.SaveChangesAsync();

            try
            {
                // Запускаем асинхронную обработку на ML-сервисе.
                // Не блокируем артиста — обработка идёт в фоне.
                // При ошибке связи логируем, но не фейлим запрос (трек уже создан).
                await _mlClient.StartProcessingAsync(
                    externalTrackId: track.Id.ToString(),
                    s3Key: track.AudioS3Path);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to start ML processing for track {TrackId}", track.Id);
                // Трек создан, но статус останется Pending — можно ретраить через UI
            }
            
            return track;
        }
        finally
        {
            await audioStreamToUpload.DisposeAsync();
        }
    }

    public async Task DeleteTrackAsync(int trackId, int artistId, bool force)
    {
        var track = await _context.Tracks
            .Include(t => t.ReleaseTracks)
                .ThenInclude(rt => rt.Release)
            .FirstOrDefaultAsync(t => t.Id == trackId);

        if (track is null)
            throw new NotFoundException("Трек не найден");

        if (track.ArtistId != artistId)
            throw new ForbiddenException("Это не ваш трек");

        // Проверка №1: опубликованные релизы — никогда нельзя удалять.
        var publishedReleases = track.ReleaseTracks
            .Where(rt => rt.Release.Status == ReleaseStatus.Published)
            .Select(rt => new { rt.Release.Id, rt.Release.Title })
            .ToList();

        if (publishedReleases.Count > 0)
        {
            throw new ConflictException(
                "Нельзя удалить трек — он входит в опубликованные релизы. " +
                "Сначала удалите релизы (они уйдут в архив).",
                new { publishedReleases });
        }

        // Проверка №2: трек в черновиках — нужен force=true.
        var draftReleases = track.ReleaseTracks
            .Where(rt => rt.Release.Status == ReleaseStatus.Draft)
            .Select(rt => new { rt.Release.Id, rt.Release.Title })
            .ToList();

        if (draftReleases.Count > 0 && !force)
        {
            throw new ConflictException(
                "Трек используется в черновиках релизов. " +
                "Подтвердите удаление, чтобы убрать его и из них.",
                new { draftReleases });
        }

        // force=true или трек свободен — удаляем.
        // ReleaseTracks улетят каскадом по конфигурации в DbContext.
        _context.Tracks.Remove(track);
        await _context.SaveChangesAsync();

        // Файлы в S3 удаляем после успешного коммита БД, чтобы не оставить
        // битых ссылок при ошибке транзакции.
        try
        {
            await _storage.DeleteFileAsync(track.AudioS3Path);
            await _storage.DeleteFileAsync(track.ImageS3Path);
        }
        catch
        {
            // S3-уборщик потом подберёт. БД уже консистентна.
        }
        
        try
        {
            await _mlClient.DeleteTrackAsync(trackId.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete track {TrackId} from ML service", trackId);
            // Не фейлим — трек из .NET удалён, ML-сервис почистит при следующей переиндексации
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    // Читает длину из аудио-стрима через TagLib.
    // Возвращает длину в секундах и новый MemoryStream с данными
    // (оригинальный стрим прочитан и больше не пригоден для загрузки).
    private static async Task<(int durationSeconds, MemoryStream audioStream)> ExtractDurationAsync(
        Stream audioStream)
    {
        // Копируем в MemoryStream — нужен и для TagLib, и для последующей загрузки в S3
        var ms = new MemoryStream();
        await audioStream.CopyToAsync(ms);
        ms.Position = 0;
 
        var duration = 0;
        try
        {
            // TagLib работает синхронно через IFileAbstraction
            var file = TagLib.File.Create(new TagLibStreamAbstraction(ms));
            duration = (int)Math.Round(file.Properties.Duration.TotalSeconds);
        }
        catch
        {
            // Если TagLib не смог прочитать — оставляем 0, не фейлим загрузку
        }
 
        ms.Position = 0;
        return (duration, ms);
    }
    
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