using Soundwave.Api.Entities;

namespace Soundwave.Api.Services;

public interface IAuthService
{
    User? GetUserByEmail(string email);
    Task<User> GetOrCreateUserAsync(string email, string name, string? picture);
    
    Task<User> RegisterAsync(string email, string password, string name);
    bool VerifyPassword(string password, string passwordHash);
    
    // Refresh tokens
    void SaveRefreshToken(int userId, string token);
    User? GetUserByRefreshToken(string token);
    void RemoveRefreshToken(string token);
}