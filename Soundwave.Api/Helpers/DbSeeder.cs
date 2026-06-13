using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Settings;

namespace Soundwave.Api.Helpers;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, AdminOptions adminOptions)
    {
        // Создаём admin-пользователя если его нет
        if (!await context.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            context.Users.Add(new User
            {
                Email = adminOptions.Email,
                Name = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminOptions.Password),
                Role = UserRole.Admin,
            });
            await context.SaveChangesAsync();
        }

        if (await context.Users.AnyAsync(u => u.Role == UserRole.Artist)) return;

        var random = new Random();

        // 1. Артисты
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

        // 2. Релизы — все опубликованные (как было раньше для альбомов).
        // Сидим разные размеры: альбомы (5 треков), EP (3 трека), сингл (1 трек),
        // чтобы сразу проверить логику типа релиза.
        var releasesData = new[]
        {
            new { Title = "After Hours",      Color = "#8b0000", Artist = artists[0], TrackCount = 5 }, // Album
            new { Title = "Meteora",          Color = "#2a4365", Artist = artists[1], TrackCount = 5 }, // Album
            new { Title = "Phonk Anthology",  Color = "#1a1a1a", Artist = artists[2], TrackCount = 3 }, // EP
            new { Title = "Hybrid Theory",    Color = "#4a5568", Artist = artists[1], TrackCount = 5 }, // Album
            new { Title = "Blinding Lights",  Color = "#2d1b1b", Artist = artists[0], TrackCount = 1 }, // Single
            new { Title = "Murder In My Mind",Color = "#0a0a0a", Artist = artists[2], TrackCount = 1 }, // Single
        };

        foreach (var data in releasesData)
        {
            var publishedAt = DateTime.UtcNow.AddMonths(-random.Next(1, 60));

            var release = new Release
            {
                Title = data.Title,
                Description = $"Official release by {data.Artist.Name}",
                ImageS3Path = $"covers/releases/{data.Title.ToLower().Replace(" ", "-")}.jpg",
                BgColor = data.Color,
                ArtistId = data.Artist.Id,
                Status = ReleaseStatus.Published,
                ReleaseDate = publishedAt,
                PublishedAt = publishedAt,
                CreatedAt = publishedAt,
                UpdatedAt = publishedAt,
            };
            context.Releases.Add(release);
            await context.SaveChangesAsync();

            // 3. Треки + связи через ReleaseTrack с Position
            for (var j = 1; j <= data.TrackCount; j++)
            {
                var track = new Track
                {
                    Title = data.TrackCount == 1
                        ? data.Title // у сингла трек называется как релиз
                        : $"{data.Title} - Track {j}",
                    AudioS3Path = $"tracks/sample-{random.Next(1, 4)}.mp3",
                    ImageS3Path = release.ImageS3Path,
                    DurationSeconds = random.Next(180, 300),
                    ArtistId = data.Artist.Id,
                    PlayCount = random.Next(500, 50000),
                    CreatedAt = publishedAt,
                    UpdatedAt = publishedAt,
                };
                context.Tracks.Add(track);
                await context.SaveChangesAsync();

                context.ReleaseTracks.Add(new ReleaseTrack
                {
                    ReleaseId = release.Id,
                    TrackId = track.Id,
                    Position = j,
                });
            }

            await context.SaveChangesAsync();
        }

        // 4. Пара "плейграунд"-треков у одного из артистов — без релиза.
        // Это нужно, чтобы на UI было видно состояние "трек свободен".
        var weeknd = artists[0];
        for (var k = 1; k <= 2; k++)
        {
            context.Tracks.Add(new Track
            {
                Title = $"Demo Sketch #{k}",
                AudioS3Path = $"tracks/sample-{random.Next(1, 4)}.mp3",
                ImageS3Path = "covers/releases/after-hours.jpg",
                DurationSeconds = random.Next(120, 240),
                ArtistId = weeknd.Id,
                PlayCount = 0,
                CreatedAt = DateTime.UtcNow.AddDays(-k),
                UpdatedAt = DateTime.UtcNow.AddDays(-k),
            });
        }

        await context.SaveChangesAsync();
    }
}