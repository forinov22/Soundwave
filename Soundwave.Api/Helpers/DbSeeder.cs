using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Settings;

namespace Soundwave.Api.Helpers;

public static class DbSeeder
{
    // ── Дев-сидинг: артисты, релизы, треки ─────────────────────────────────

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Role == UserRole.Artist)) return;

        var rng = new Random(42); // фиксированный seed для воспроизводимости

        var artists = new List<Artist>
        {
            new()
            {
                Name = "The Weeknd",
                Email = "abel@xo.com",
                Role = UserRole.Artist,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("starboy123"),
                BackgroundImage = "artists/banners/the-weeknd.jpg",
                Avatar = "artists/avatars/the-weeknd-avatar.jpg",
                Description = "Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer-songwriter and record producer. Known for his sonic versatility and dark lyricism."
            },
            new()
            {
                Name = "Linkin Park",
                Email = "contact@lp.com",
                Role = UserRole.Artist,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("numb123"),
                BackgroundImage = "artists/banners/the-weeknd.jpg",
                Avatar = "artists/avatars/the-weeknd-avatar.jpg",
                Description = "Linkin Park is an American rock band from Agoura Hills, California. The band's current lineup comprises vocalists Mike Shinoda and Emily Armstrong."
            },
            new()
            {
                Name = "Interworld",
                Email = "phonk@interworld.com",
                Role = UserRole.Artist,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("phonk-master"),
                BackgroundImage = "artists/banners/the-weeknd.jpg",
                Avatar = "artists/avatars/the-weeknd-avatar.jpg",
                Description = "A leading figure in the modern Phonk scene, best known for the global hit 'Metamorphosis'."
            }
        };

        context.Users.AddRange(artists);
        await context.SaveChangesAsync();

        // PlayCount: степенное распределение — хиты на несколько порядков выше «глубоких катов»
        static int RealisticPlays(Random r, int baseMin, int baseMax, double scale)
        {
            var b = r.Next(baseMin, baseMax);
            var exp = 1.0 + r.NextDouble() * 1.5;
            return (int)(Math.Pow(b, exp) * scale);
        }

        var releasesData = new[]
        {
            new { Title = "After Hours",        Color = "#8b0000", Artist = artists[0], TrackCount = 5, BaseMin = 800, BaseMax = 1200, Scale = 120.0 },
            new { Title = "Blinding Lights",    Color = "#2d1b1b", Artist = artists[0], TrackCount = 1, BaseMin = 900, BaseMax = 1400, Scale = 180.0 },
            new { Title = "Meteora",            Color = "#2a4365", Artist = artists[1], TrackCount = 5, BaseMin = 700, BaseMax = 1100, Scale = 100.0 },
            new { Title = "Hybrid Theory",      Color = "#4a5568", Artist = artists[1], TrackCount = 5, BaseMin = 750, BaseMax = 1200, Scale = 110.0 },
            new { Title = "Phonk Anthology",    Color = "#1a1a1a", Artist = artists[2], TrackCount = 3, BaseMin = 200, BaseMax = 600,  Scale = 50.0  },
            new { Title = "Murder In My Mind",  Color = "#0a0a0a", Artist = artists[2], TrackCount = 1, BaseMin = 400, BaseMax = 800,  Scale = 80.0  },
        };

        foreach (var data in releasesData)
        {
            var publishedAt = DateTime.UtcNow.AddMonths(-rng.Next(3, 60));

            var release = new Release
            {
                Title = data.Title,
                Description = $"Official release by {data.Artist.Name}",
                ImageS3Path = "covers/releases/superman.jpg",
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

            for (var j = 1; j <= data.TrackCount; j++)
            {
                // Заглавный трек — самый популярный; остальные убывают
                var hitMult = j == 1 ? 1.0 : j == 2 ? 0.7 : 0.5;
                var track = new Track
                {
                    Title = data.TrackCount == 1 ? data.Title : $"{data.Title} - Track {j}",
                    AudioS3Path = $"tracks/sample-{rng.Next(1, 5)}.mp3",
                    ImageS3Path = release.ImageS3Path,
                    DurationSeconds = rng.Next(180, 300),
                    ArtistId = data.Artist.Id,
                    PlayCount = RealisticPlays(rng, data.BaseMin, data.BaseMax, data.Scale * hitMult),
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

        // Плейграунд-треки без релиза
        var weeknd = artists[0];
        for (var k = 1; k <= 2; k++)
        {
            context.Tracks.Add(new Track
            {
                Title = $"Demo Sketch #{k}",
                AudioS3Path = $"tracks/sample-{rng.Next(1, 4)}.mp3",
                ImageS3Path = "covers/releases/superman.jpg",
                DurationSeconds = rng.Next(120, 240),
                ArtistId = weeknd.Id,
                PlayCount = 0,
                CreatedAt = DateTime.UtcNow.AddDays(-k),
                UpdatedAt = DateTime.UtcNow.AddDays(-k),
            });
        }
        await context.SaveChangesAsync();
    }

    // ── Сидинг статистики прослушиваний — работает в обоих окружениях ───────
    //
    // Создаёт фейковых слушателей с разными вкусовыми профилями и заполняет
    // ListenEvent-записи. Метод идемпотентен: если фейковые слушатели уже есть,
    // ничего не делает.

    private const string FakeListenerMarker = "@fake-listener.internal";

    public static async Task SeedListenStatsAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Email.EndsWith(FakeListenerMarker)))
            return;

        var tracks = await context.Tracks
            .Where(t => t.ReleaseTracks.Any(rt => rt.Release.Status == ReleaseStatus.Published))
            .ToListAsync();

        if (tracks.Count == 0) return;

        var rng = new Random(1337);

        // Все уникальные artistId из опубликованных треков, в детерминированном порядке
        var artistIds = tracks.Select(t => t.ArtistId).Distinct().OrderBy(id => id).ToList();

        // Профили: один «фанат» на каждого артиста + 2 общих слушателя.
        // Weight(artistId) → интерес [0..1].
        var profiles = new List<(string Name, Func<int, double> Weight)>();

        foreach (var favId in artistIds)
        {
            var captured = favId;
            profiles.Add((
                Name: $"Fan_{captured}",
                Weight: id => id == captured ? 1.0 : 0.15
            ));
        }

        profiles.Add(("Mainstream", _ => 0.6));
        profiles.Add(("Explorer",   _ => 0.4));

        var fakeListeners = profiles.Select((p, i) => new User
        {
            Name = p.Name,
            Email = $"listener{i + 1}{FakeListenerMarker}",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            Role = UserRole.Listener,
        }).ToList();

        context.Users.AddRange(fakeListeners);
        await context.SaveChangesAsync();

        var maxPlayCount = tracks.Max(t => t.PlayCount);
        var allEvents = new List<ListenEvent>();

        for (var li = 0; li < fakeListeners.Count; li++)
        {
            var listener = fakeListeners[li];
            var weight   = profiles[li].Weight;

            foreach (var track in tracks)
            {
                var popularity = maxPlayCount > 0 ? (double)track.PlayCount / maxPlayCount : 0.05;
                var interest   = weight(track.ArtistId);
                var eventCount = (int)Math.Round(interest * popularity * 40.0 + rng.NextDouble() * 3);
                if (eventCount <= 0) continue;

                for (var e = 0; e < eventCount; e++)
                {
                    // Экспоненциальный decay: недавние события вероятнее
                    var u = Math.Max(1e-9, rng.NextDouble());
                    var daysAgo = Math.Clamp((int)(-Math.Log(u) / Math.Log(365) * 365), 0, 364);

                    allEvents.Add(new ListenEvent
                    {
                        UserId    = listener.Id,
                        TrackId   = track.Id,
                        ListenedAt = DateTime.UtcNow
                            .AddDays(-daysAgo)
                            .AddHours(-rng.Next(0, 24))
                            .AddMinutes(-rng.Next(0, 60)),
                    });
                }
            }
        }

        allEvents = [.. allEvents.OrderBy(_ => rng.Next())];
        context.ListenEvents.AddRange(allEvents);
        await context.SaveChangesAsync();
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public static async Task SeedAdminAsync(AppDbContext context, AdminOptions adminOptions)
    {
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
    }
}
