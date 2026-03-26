namespace backend.Models;

public class Album
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImagePath { get; set; }
    public int? ReleaseYear { get; set; }

    public int? ArtistId { get; set; }
    public Artist? Artist { get; set; }

    public ICollection<Song> Songs { get; set; } = new List<Song>();
}
