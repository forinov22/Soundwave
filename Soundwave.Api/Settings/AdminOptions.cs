namespace Soundwave.Api.Settings;

public class AdminOptions
{
    public const string AdminSettings = "AdminSettings";

    public string Email { get; set; } = "admin@soundwave.com";
    public string Password { get; set; } = "admin123";
}
