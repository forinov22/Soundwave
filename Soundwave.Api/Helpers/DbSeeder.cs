using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;

namespace Soundwave.Api.Helpers;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Проверяем, есть ли уже данные (используем Users, так как Artist — это User)
        if (await context.Users.AnyAsync(u => u.Role == UserRole.Artist)) return;

        var random = new Random();

        // 1. Создаем реальных артистов
        var artists = new List<Artist>
        {
            new Artist 
            { 
                Name = "The Weeknd", 
                Email = "abel@xo.com", 
                Role = UserRole.Artist,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("starboy123"),
                BackgroundImage = "artists/banners/the-weeknd.jpg",
                Avatar = "artists/avatars/the-weeknd-avatar.jpg",
                Description = "Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer-songwriter and record producer. Known for his sonic versatility and dark lyricism."
            },
            new Artist 
            { 
                Name = "Linkin Park", 
                Email = "contact@lp.com", 
                Role = UserRole.Artist,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("numb123"),
                BackgroundImage = "artists/banners/linkin-park.jpg",
                Avatar = "artists/avatars/linkin-park-avatar.jpg",
                Description = "Linkin Park is an American rock band from Agoura Hills, California. The band's current lineup comprises vocalists Mike Shinoda and Emily Armstrong."
            },
            new Artist 
            { 
                Name = "Interworld", 
                Email = "phonk@interworld.com", 
                Role = UserRole.Artist,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("phonk-master"),
                BackgroundImage = "artists/banners/interworld.jpg",
                Avatar = "artists/avatars/interworld-avatar.jpg",
                Description = "A leading figure in the modern Phonk scene, best known for the global hit 'Metamorphosis'."
            }
        };

        context.Users.AddRange(artists);
        await context.SaveChangesAsync();

        // 2. Данные для альбомов
        var albumsData = new[] {
            new { Title = "After Hours", Color = "#8b0000", Artist = artists[0] },
            new { Title = "Meteora", Color = "#2a4365", Artist = artists[1] },
            new { Title = "Phonk Anthology", Color = "#1a1a1a", Artist = artists[2] },
            new { Title = "Hybrid Theory", Color = "#4a5568", Artist = artists[1] },
        };

        foreach (var data in albumsData)
        {
            var album = new Album
            {
                Title = data.Title,
                Description = $"Official release by {data.Artist.Name}",
                ImageS3Path = $"covers/albums/{data.Title.ToLower().Replace(" ", "-")}.jpg",
                BgColor = data.Color,
                ArtistId = data.Artist.Id,
                ReleaseDate = DateTime.UtcNow.AddMonths(-random.Next(1, 60)),
                PlayCount = random.Next(1000, 100000),
            };
            context.Albums.Add(album);
            await context.SaveChangesAsync(); // Сохраняем, чтобы получить ID альбома для треков

            // 3. Генерируем треки для каждого альбома
            for (var j = 1; j <= 5; j++)
            {
                context.Tracks.Add(new Track
                {
                    Title = $"{data.Title} - Track {j}",
                    AudioS3Path = $"tracks/sample-{random.Next(1, 4)}.mp3",
                    ImageS3Path = album.ImageS3Path, // Обычно у треков в альбоме та же обложка
                    DurationSeconds = random.Next(180, 300),
                    ArtistId = data.Artist.Id,
                    AlbumId = album.Id,
                    PlayCount = random.Next(500, 50000)
                });
            }
        }

        await context.SaveChangesAsync();
    }
}
