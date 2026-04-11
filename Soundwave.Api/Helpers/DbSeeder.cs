using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;

namespace Soundwave.Api.Helpers;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Albums.AnyAsync()) return;

        var admin = new User { 
            Name = "Soundwave Global", 
            Email = "official@soundwave.com", 
            Role = UserRole.Artist,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("system_generated"), 
        };
        context.Users.Add(admin);
        await context.SaveChangesAsync();

        var albumsData = new[] {
            new { Name = "Top 50 Global", Color = "#2a4365" },
            new { Name = "Top 50 India", Color = "#22543d" },
            new { Name = "Trending Global", Color = "#44337a" },
            new { Name = "Mega Hits", Color = "#234e52" },
            new { Name = "Happy Favorites", Color = "#744210" },
        };

        for (var i = 0; i < albumsData.Length; i++)
        {
            var model = albumsData[i];
            var album = new Album
            {
                Title = model.Name,
                Description = "Your weekly update of the most played tracks",
                ImageS3Path = $"covers/albums/img{i % 3 + 1}.jpg",
                BgColor = model.Color,
                ArtistId = admin.Id,
                ReleaseDate = DateTime.UtcNow,
                PlayCount = new Random().Next(100, 10000),
            };
            context.Albums.Add(album);
        }
        await context.SaveChangesAsync();

        var firstAlbum = await context.Albums.FirstAsync();
        
        for (var i = 1; i <= 8; i++)
        {
            context.Tracks.Add(new Track
            {
                Title = $"Track {i}",
                AudioS3Path = $"tracks/track{(i % 3 + 1)}.mp3",
                ImageS3Path = $"covers/tracks/img{i % 3 + 1}.jpg",
                DurationSeconds = 150 + (i * 10),
                ArtistId = admin.Id,
                AlbumId = firstAlbum.Id,
                PlayCount = new Random().Next(100, 10000)
            });
        }

        await context.SaveChangesAsync();
    }
}
