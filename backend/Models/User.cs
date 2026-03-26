namespace backend.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ProfileImagePath { get; set; }
    public bool IsBlocked { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }

    public string Role { get; set; } = "User"; // "Admin" or "User"
    public string SubscriptionPlan { get; set; } = "Free"; // "Free", "Premium", "Pro"

    public ICollection<Song> Songs { get; set; } = new List<Song>();
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    public ICollection<FavoriteSong> FavoriteSongs { get; set; } = new List<FavoriteSong>();
    public ICollection<RecentlyPlayed> RecentlyPlayed { get; set; } = new List<RecentlyPlayed>();
}
