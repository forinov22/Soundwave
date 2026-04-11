using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Entities;

namespace Soundwave.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<User> Users => Set<User>();
    

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Связь Артист - Треки (Один-ко-многим)
        modelBuilder.Entity<Track>()
            .HasOne(t => t.Artist)
            .WithMany(u => u.Tracks)
            .HasForeignKey(t => t.ArtistId)
            .OnDelete(DeleteBehavior.Restrict); // Чтобы удаление юзера не ломало базу каскадно

        // 2. Связь Альбом - Треки (Один-ко-многим)
        modelBuilder.Entity<Track>()
            .HasOne(t => t.Album)
            .WithMany(a => a.Tracks)
            .HasForeignKey(t => t.AlbumId)
            .OnDelete(DeleteBehavior.SetNull);

        // 3. Многие-ко-многим: Лайкнутые треки
        modelBuilder.Entity<User>()
            .HasMany(u => u.LikedTracks)
            .WithMany() // У трека нет коллекции "UsersWhoLiked", поэтому оставляем пустым
            .UsingEntity(j => j.ToTable("UserLikedTracks"));

        // 4. Связь Пользователь - Плейлисты (Один-ко-многим)
        modelBuilder.Entity<Playlist>()
            .HasOne(p => p.Owner) // Убедись, что в сущности Playlist есть свойство Owner или User
            .WithMany(u => u.Playlists)
            .HasForeignKey(p => p.OwnerId);
    }
}