namespace Soundwave.Api.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder);
    Task DeleteFileAsync(string fileKey);
    string GetPresignedUrl(string objectKey, int expiresHours = 24);
}