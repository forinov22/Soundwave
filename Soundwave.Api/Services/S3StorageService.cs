using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Soundwave.Api.Interfaces;
using Soundwave.Api.Settings;

namespace Soundwave.Api.Services;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Options _options;

    public S3StorageService(IOptions<S3Options> s3Options)
    {
        _options = s3Options.Value;

        var config = new AmazonS3Config
        {
            ForcePathStyle = _options.ForcePathStyle,
            ServiceURL = _options.ServiceUrl,
            UseHttp = true,
        };

        _s3Client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder)
    {
        var objectKey = $"{folder.TrimEnd('/')}/{Guid.NewGuid()}_{fileName}";

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(request);
        return objectKey;
    }

    public string GetPresignedUrl(string objectKey, int expiresHours = 24)
    {
        if (string.IsNullOrEmpty(objectKey)) return string.Empty;

        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            Expires = DateTime.UtcNow.AddHours(expiresHours),
            Protocol = Protocol.HTTP,
        };

        return _s3Client.GetPreSignedURL(request);
    }

    public async Task DeleteFileAsync(string objectKey)
    {
        await _s3Client.DeleteObjectAsync(_options.BucketName, objectKey);
    }
}