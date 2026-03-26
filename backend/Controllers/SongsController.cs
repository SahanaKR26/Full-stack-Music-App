using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SongsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public SongsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile? audioFile, [FromForm] IFormFile? artFile,
        [FromForm] string title, [FromForm] string artist,
        [FromForm] string album, [FromForm] string? genre,
        [FromForm] int? artistId, [FromForm] int? albumId)
    {
        if (audioFile == null || audioFile.Length == 0) return BadRequest("Audio file is required.");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsPath = Path.Combine(webRoot, "Uploads");
        Directory.CreateDirectory(uploadsPath);

        var audioFileName = $"{Guid.NewGuid()}{Path.GetExtension(audioFile.FileName)}";
        await using (var stream = new FileStream(Path.Combine(uploadsPath, audioFileName), FileMode.Create))
            await audioFile.CopyToAsync(stream);

        string artFileName = string.Empty;
        if (artFile != null && artFile.Length > 0)
        {
            artFileName = $"{Guid.NewGuid()}{Path.GetExtension(artFile.FileName)}";
            await using var stream = new FileStream(Path.Combine(uploadsPath, artFileName), FileMode.Create);
            await artFile.CopyToAsync(stream);
        }

        var song = new Song
        {
            Title = string.IsNullOrEmpty(title) ? Path.GetFileNameWithoutExtension(audioFile.FileName) : title,
            Artist = string.IsNullOrEmpty(artist) ? "Unknown Artist" : artist,
            Album = string.IsNullOrEmpty(album) ? "Unknown Album" : album,
            Genre = genre ?? string.Empty,
            ArtistId = artistId,
            AlbumId = albumId,
            FilePath = $"/Uploads/{audioFileName}",
            AlbumArtPath = string.IsNullOrEmpty(artFileName) ? "" : $"/Uploads/{artFileName}",
            UploadDate = DateTime.UtcNow,
            UserId = userId
        };

        _context.Songs.Add(song);
        await _context.SaveChangesAsync();
        return Ok(song);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Songs.OrderByDescending(s => s.UploadDate).ToListAsync());

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(new List<Song>());
        var songs = await _context.Songs
            .Where(s => s.Title.Contains(query) || s.Artist.Contains(query)
                     || s.Album.Contains(query) || s.Genre.Contains(query))
            .ToListAsync();
        return Ok(songs);
    }

    // Track plays and recently played history
    [HttpPost("{id:int}/play")]
    public async Task<IActionResult> RecordPlay(int id)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var song = await _context.Songs.FindAsync(id);
        if (song == null) return NotFound();

        song.PlayCount++;

        // Keep last 50 entries per user
        var existing = _context.RecentlyPlayed
            .Where(rp => rp.UserId == userId && rp.SongId == id);
        _context.RecentlyPlayed.RemoveRange(existing);

        _context.RecentlyPlayed.Add(new RecentlyPlayed
        {
            UserId = userId,
            SongId = id,
            PlayedAt = DateTime.UtcNow
        });

        // Trim to 50
        var oldEntries = await _context.RecentlyPlayed
            .Where(rp => rp.UserId == userId)
            .OrderByDescending(rp => rp.PlayedAt)
            .Skip(50)
            .ToListAsync();
        _context.RecentlyPlayed.RemoveRange(oldEntries);

        await _context.SaveChangesAsync();
        return Ok(new { playCount = song.PlayCount });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var song = await _context.Songs.FindAsync(id);
        if (song == null) return NotFound();
        _context.Songs.Remove(song);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Song deleted" });
    }
}
