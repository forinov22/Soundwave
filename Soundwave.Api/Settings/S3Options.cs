namespace Soundwave.Api.Settings;

public class S3Options
{
    public const string S3Settings = "S3Settings";

    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string ServiceUrl { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public bool ForcePathStyle { get; set; }
    public string PublicEndpoint { get; set; } = string.Empty;
}