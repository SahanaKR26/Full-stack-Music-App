namespace backend.Models;

public class FavoriteSong
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int SongId { get; set; }
    public Song Song { get; set; } = null!;
}
