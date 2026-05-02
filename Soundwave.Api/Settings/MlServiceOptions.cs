namespace Soundwave.Api.Settings;

public class MlServiceOptions
{
    public const string MlServiceSettings = "MlServiceSettings";

    public string BaseUrl { get; set; } = string.Empty;
    public string InternalToken { get; set; } = string.Empty;
}