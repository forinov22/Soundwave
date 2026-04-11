using System.ComponentModel.DataAnnotations;

namespace Soundwave.Api.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    [MaxLength(256)]
    public string Token { get; set; } = string.Empty;
    public DateTime ExpirationDate { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}