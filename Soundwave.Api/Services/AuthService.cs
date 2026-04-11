using System.Text;
using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;

namespace Soundwave.Api.Services;

public interface IAuthService
{
    User? GetUserByEmail(string email);
    User GetOrCreateUser(string email, string name, string? picture);
    
    Task<User> RegisterAsync(string email, string password, string name);
    bool VerifyPassword(string password, string passwordHash);
    
    // Refresh tokens
    void SaveRefreshToken(int userId, string token);
    User? GetUserByRefreshToken(string token);
    void RemoveRefreshToken(string token);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;

    public AuthService(AppDbContext db) => _db = db;

    public User? GetUserByEmail(string email)
    {
        var user = _db.Users.FirstOrDefault(u => u.Email == email);
        return user;
    }
    
    public User GetOrCreateUser(string email, string name, string picutre)
    {
        var user = _db.Users.FirstOrDefault(u => u.Email == email);
        if (user is not null) return user;

        user = new User
        {
            Email = email,
            Name = name,
            Avatar = picutre,
        };

        _db.Users.Add(user);
        _db.SaveChanges();

        return user;
    }
    
    public async Task<User> RegisterAsync(string email, string password, string name)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        
        var user = new User
        {
            Email = email,
            Name = name,
            PasswordHash = passwordHash,
            Role = UserRole.Listener,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
    
    public void SaveRefreshToken(int userId, string token)
    {
        _db.RefreshTokens.Add(new RefreshToken
        {
            Token = token,
            UserId = userId,
            ExpirationDate = DateTime.UtcNow.AddDays(7)
        });

        _db.SaveChanges();
    }
    
    public User? GetUserByRefreshToken(string token)
    {
        var refresh = _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefault(r => r.Token == token && r.ExpirationDate > DateTime.UtcNow);

        return refresh?.User;
    }
    
    public void RemoveRefreshToken(string token)
    {
        var refresh = _db.RefreshTokens.FirstOrDefault(r => r.Token == token);
        if (refresh == null) return;

        _db.RefreshTokens.Remove(refresh);
        _db.SaveChanges();
    }
}