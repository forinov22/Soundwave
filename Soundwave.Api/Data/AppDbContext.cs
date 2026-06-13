using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Entities;

namespace Soundwave.Api.Data;

public class AppDbContext : DbContext
{
    public DbSet<Release> Releases => Set<Release>();
    public DbSet<ReleaseTrack> ReleaseTracks => Set<ReleaseTrack>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistTrack> PlaylistTracks => Set<PlaylistTrack>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserLikedRelease> UserLikedReleases => Set<UserLikedRelease>();
    public DbSet<UserFollowedArtist> UserFollowedArtists => Set<UserFollowedArtist>();
    public DbSet<UserSavedPlaylist> UserSavedPlaylists => Set<UserSavedPlaylist>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TPH-наследование User → Artist
        modelBuilder.Entity<User>()
            .HasDiscriminator<UserRole>("Role")
            .HasValue<User>(UserRole.Listener)
            .HasValue<Artist>(UserRole.Artist);

        // Артист — треки (1:N)
        modelBuilder.Entity<Artist>()
            .HasMany(a => a.Tracks)
            .WithOne(t => t.Artist)
            .HasForeignKey(t => t.ArtistId)
            .OnDelete(DeleteBehavior.Cascade);

        // Артист — релизы (1:N)
        modelBuilder.Entity<Artist>()
            .HasMany(a => a.Releases)
            .WithOne(r => r.Artist)
            .HasForeignKey(r => r.ArtistId)
            .OnDelete(DeleteBehavior.Cascade);

        // Релиз — треки (M:N через ReleaseTrack с Position)
        modelBuilder.Entity<ReleaseTrack>()
            .HasKey(rt => new { rt.ReleaseId, rt.TrackId });

        modelBuilder.Entity<ReleaseTrack>()
            .HasOne(rt => rt.Release)
            .WithMany(r => r.ReleaseTracks)
            .HasForeignKey(rt => rt.ReleaseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReleaseTrack>()
            .HasOne(rt => rt.Track)
            .WithMany(t => t.ReleaseTracks)
            .HasForeignKey(rt => rt.TrackId)
            // Удаление трека тянет за собой связи. Сервис всё равно проверит,
            // что трек не входит в опубликованные релизы — сюда мы попадём
            // только в разрешённых случаях (force-delete с черновиков).
            .OnDelete(DeleteBehavior.Cascade);

        // Уникальность позиции в пределах релиза — мягкая защита
        // от дублей при конкурентных вставках.
        modelBuilder.Entity<ReleaseTrack>()
            .HasIndex(rt => new { rt.ReleaseId, rt.Position })
            .IsUnique();

        modelBuilder.Entity<PlaylistTrack>()
            .HasKey(pt => new { pt.PlaylistId, pt.TrackId });
 
        modelBuilder.Entity<PlaylistTrack>()
            .HasOne(pt => pt.Playlist)
            .WithMany(p => p.PlaylistTracks)
            .HasForeignKey(pt => pt.PlaylistId)
            .OnDelete(DeleteBehavior.Cascade);
 
        modelBuilder.Entity<PlaylistTrack>()
            .HasOne(pt => pt.Track)
            .WithMany()
            .HasForeignKey(pt => pt.TrackId)
            .OnDelete(DeleteBehavior.Cascade);
 
        modelBuilder.Entity<PlaylistTrack>()
            .HasIndex(pt => new { pt.PlaylistId, pt.Position })
            .IsUnique();
 
        // Плейлист → владелец
        modelBuilder.Entity<Playlist>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Playlists)
            .HasForeignKey(p => p.OwnerId);

        // UserLikedReleases
        modelBuilder.Entity<UserLikedRelease>()
            .HasKey(x => new { x.UserId, x.ReleaseId });

        // UserFollowedArtists
        modelBuilder.Entity<UserFollowedArtist>()
            .HasKey(x => new { x.UserId, x.ArtistId });

        // UserSavedPlaylists
        modelBuilder.Entity<UserSavedPlaylist>()
            .HasKey(x => new { x.UserId, x.PlaylistId });
    }
}