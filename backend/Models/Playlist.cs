namespace backend.Models;

public class Playlist
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User? User { get; set; }

    public ICollection<PlaylistSong> PlaylistSongs { get; set; } = new List<PlaylistSong>();
}
