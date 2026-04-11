using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soundwave.Api.DTOs;
using Soundwave.Api.Entities;
using Soundwave.Api.Services;

namespace Soundwave.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ITokenService _tokenService;

    public AuthController(IAuthService authService, ITokenService tokenService)
    {
        _authService = authService;
        _tokenService = tokenService;
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var email = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
        if (email is null) return Unauthorized();

        var user = _authService.GetUserByEmail(email);
        if (user is null) return Unauthorized();

        return Ok(new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            avatar = user.Avatar,
            role = user.Role.ToString().ToLower() // "listener" or "artist"
        });
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (_authService.GetUserByEmail(request.Email) != null)
        {
            return BadRequest("Пользователь с таким Email уже существует");
        }

        var user = await _authService.RegisterAsync(request.Email, request.Password, request.Name);

        return await GenerateAuthResponse(user);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = _authService.GetUserByEmail(request.Email);
    
        if (user is null
            || user.PasswordHash.Length == 0
            || !_authService.VerifyPassword(request.Password, user.PasswordHash)) 
        {
            return Unauthorized("Неверный email или пароль");
        }

        return await GenerateAuthResponse(user);
    }

    private async Task<IActionResult> GenerateAuthResponse(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
    
        _authService.SaveRefreshToken(user.Id, refreshToken);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        return Ok(new { accessToken });
    }

    [HttpGet("login/google")]
    public IActionResult LoginWithGoogle()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = "/auth/google/callback"
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> Callback()
    {
        var result = await HttpContext.AuthenticateAsync("GoogleCookies");
        if (!result.Succeeded)
        {
            Redirect("http://localhost:3000/auth-callback");
        }

        var claims = result.Principal!.Claims.ToList();

        var email = claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;
        var name = claims.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value;
        var picture = claims.FirstOrDefault(x => x.Type == "picture")?.Value;
        if (email is null)
        {
            return Redirect("http://localhost:3000/auth-callback");
        }
        
        var user = _authService.GetOrCreateUser(email, name, picture);
        
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        
        _authService.SaveRefreshToken(user.Id, refreshToken);

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        return Redirect($"http://localhost:3000/auth-callback?accessToken={accessToken}");
    }
    
    [HttpPost("refresh")]
    public IActionResult Refresh()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return Unauthorized();

        var user = _authService.GetUserByRefreshToken(refreshToken);
        if (user is null) return Unauthorized();

        _authService.RemoveRefreshToken(refreshToken);

        var newRefreshToken = _tokenService.GenerateRefreshToken();
        _authService.SaveRefreshToken(user.Id, newRefreshToken);

        var newAccessToken = _tokenService.GenerateAccessToken(user);

        Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        return Ok(new { accessToken = newAccessToken });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];

        if (refreshToken != null)
        {
            _authService.RemoveRefreshToken(refreshToken);
        }

        Response.Cookies.Delete("refreshToken");

        return Ok();
    }
}