namespace Soundwave.Api.Settings;

public class GoogleOptions
{
    public const string GoogleSettings = "GoogleOptions";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}