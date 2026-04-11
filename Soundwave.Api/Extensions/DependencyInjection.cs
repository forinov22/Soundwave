using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Soundwave.Api.Interfaces;
using Soundwave.Api.Services;
using Soundwave.Api.Settings;

namespace Soundwave.Api.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<S3Options>(configuration.GetSection(S3Options.S3Settings));
        services.Configure<GoogleOptions>(configuration.GetSection(GoogleOptions.GoogleSettings));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IStorageService, S3StorageService>();
        services.AddScoped<IMusicService, MusicService>();

        return services;
    }

    public static IServiceCollection AddAuthServices(this IServiceCollection services, IConfiguration configuration)
    {
        var googleSettings = configuration.GetSection(GoogleOptions.GoogleSettings).Get<GoogleOptions>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddCookie("GoogleCookies")
        .AddGoogle(options =>
        {
            options.SignInScheme = "GoogleCookies";
            options.ClientId = googleSettings!.ClientId;
            options.ClientSecret = googleSettings.ClientSecret;
            
            options.Scope.Add("profile");
            options.Events.OnCreatingTicket = (context) =>
            {                      
                var picture = context.User.GetProperty("picture").GetString();
                if (!string.IsNullOrEmpty(picture))
                {
                    context.Identity?.AddClaim(new Claim("picture", picture));
                }
                return Task.CompletedTask;
            };
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TokenService.Secret)),
            };
        });

        services.AddAuthorization();
        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("frontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
        return services;
    }
}