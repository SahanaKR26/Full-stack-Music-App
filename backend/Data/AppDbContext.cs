using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Song> Songs { get; set; }
    public DbSet<Playlist> Playlists { get; set; }
    public DbSet<PlaylistSong> PlaylistSongs { get; set; }
    public DbSet<FavoriteSong> FavoriteSongs { get; set; }
    public DbSet<Artist> Artists { get; set; }
    public DbSet<Album> Albums { get; set; }
    public DbSet<RecentlyPlayed> RecentlyPlayed { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PlaylistSong M:N
        modelBuilder.Entity<PlaylistSong>()
            .HasKey(ps => new { ps.PlaylistId, ps.SongId });
        modelBuilder.Entity<PlaylistSong>()
            .HasOne(ps => ps.Playlist).WithMany(p => p.PlaylistSongs).HasForeignKey(ps => ps.PlaylistId);
        modelBuilder.Entity<PlaylistSong>()
            .HasOne(ps => ps.Song).WithMany(s => s.PlaylistSongs).HasForeignKey(ps => ps.SongId);

        // FavoriteSong M:N
        modelBuilder.Entity<FavoriteSong>()
            .HasKey(fs => new { fs.UserId, fs.SongId });
        modelBuilder.Entity<FavoriteSong>()
            .HasOne(fs => fs.User).WithMany(u => u.FavoriteSongs).HasForeignKey(fs => fs.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<FavoriteSong>()
            .HasOne(fs => fs.Song).WithMany().HasForeignKey(fs => fs.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        // RecentlyPlayed
        modelBuilder.Entity<RecentlyPlayed>()
            .HasOne(rp => rp.User).WithMany(u => u.RecentlyPlayed).HasForeignKey(rp => rp.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<RecentlyPlayed>()
            .HasOne(rp => rp.Song).WithMany().HasForeignKey(rp => rp.SongId)
            .OnDelete(DeleteBehavior.Cascade);

        // Song → Artist / Album (optional)
        modelBuilder.Entity<Song>()
            .HasOne(s => s.ArtistEntity).WithMany(a => a.Songs).HasForeignKey(s => s.ArtistId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Song>()
            .HasOne(s => s.AlbumEntity).WithMany(a => a.Songs).HasForeignKey(s => s.AlbumId)
            .OnDelete(DeleteBehavior.SetNull);

        // Album → Artist
        modelBuilder.Entity<Album>()
            .HasOne(a => a.Artist).WithMany(ar => ar.Albums).HasForeignKey(a => a.ArtistId)
            .OnDelete(DeleteBehavior.SetNull);

        // Unique username
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();
    }
}
