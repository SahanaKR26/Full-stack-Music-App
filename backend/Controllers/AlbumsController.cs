using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AlbumsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AlbumsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Albums
            .Include(a => a.Artist)
            .OrderBy(a => a.Title)
            .Select(a => new { a.Id, a.Title, a.CoverImagePath, a.ReleaseYear, ArtistName = a.Artist!.Name })
            .ToListAsync());

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var album = await _context.Albums
            .Include(a => a.Artist)
            .Include(a => a.Songs)
            .FirstOrDefaultAsync(a => a.Id == id);
        return album == null ? NotFound() : Ok(album);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] AlbumDto dto)
    {
        var album = new Album
        {
            Title = dto.Title,
            ArtistId = dto.ArtistId,
            ReleaseYear = dto.ReleaseYear
        };

        if (dto.Cover != null)
        {
            var dir = Path.Combine(_env.WebRootPath, "Uploads", "Albums");
            Directory.CreateDirectory(dir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Cover.FileName)}";
            var path = Path.Combine(dir, fileName);
            await using var stream = new FileStream(path, FileMode.Create);
            await dto.Cover.CopyToAsync(stream);
            album.CoverImagePath = $"/Uploads/Albums/{fileName}";
        }

        _context.Albums.Add(album);
        await _context.SaveChangesAsync();
        return Ok(album);
    }

    [HttpPost("{id}/songs/{songId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddSong(int id, int songId)
    {
        var song = await _context.Songs.FindAsync(songId);
        if (song == null) return NotFound("Song not found");
        song.AlbumId = id;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Song added to album" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var album = await _context.Albums.FindAsync(id);
        if (album == null) return NotFound();
        _context.Albums.Remove(album);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Album deleted" });
    }
}

public class AlbumDto
{
    public string Title { get; set; } = string.Empty;
    public int? ArtistId { get; set; }
    public int? ReleaseYear { get; set; }
    public IFormFile? Cover { get; set; }
}
