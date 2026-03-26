namespace backend.Models;

public class Song
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty; // kept for backward compat / Jamendo songs
    public string Album { get; set; } = string.Empty;  // kept for backward compat
    public string FilePath { get; set; } = string.Empty;
    public string AlbumArtPath { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public double Duration { get; set; }
    public int PlayCount { get; set; } = 0;
    public DateTime UploadDate { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    // Optional FK links to proper Artist / Album entities
    public int? ArtistId { get; set; }
    public Artist? ArtistEntity { get; set; }

    public int? AlbumId { get; set; }
    public Album? AlbumEntity { get; set; }

    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = new List<PlaylistSong>();
}
