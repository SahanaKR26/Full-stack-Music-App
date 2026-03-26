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
public class PlaylistsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlaylistsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlaylistDto request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var playlist = new Playlist
        {
            Name = request.Name,
            UserId = userId
        };

        _context.Playlists.Add(playlist);
        await _context.SaveChangesAsync();

        return Ok(playlist);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPlaylists()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var playlists = await _context.Playlists
            .Include(p => p.PlaylistSongs)
            .ThenInclude(ps => ps.Song)
            .Where(p => p.UserId == userId)
            .ToListAsync();

        return Ok(playlists);
    }

    [HttpPost("{id}/songs")]
    public async Task<IActionResult> AddSong(int id, [FromBody] int songId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (playlist == null) return NotFound("Playlist not found or access denied.");

        if (_context.PlaylistSongs.Any(ps => ps.PlaylistId == id && ps.SongId == songId))
            return BadRequest("Song already in playlist.");

        _context.PlaylistSongs.Add(new PlaylistSong { PlaylistId = id, SongId = songId });
        await _context.SaveChangesAsync();

        return Ok(new { message = "Song added to playlist." });
    }

    [HttpDelete("{id}/songs/{songId}")]
    public async Task<IActionResult> RemoveSong(int id, int songId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var playlist = await _context.Playlists.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (playlist == null) return NotFound("Playlist not found or access denied.");

        var playlistSong = await _context.PlaylistSongs.FirstOrDefaultAsync(ps => ps.PlaylistId == id && ps.SongId == songId);
        if (playlistSong == null) return NotFound("Song not found in playlist.");

        _context.PlaylistSongs.Remove(playlistSong);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Song removed from playlist." });
    }
}

public class PlaylistDto
{
    public string Name { get; set; } = string.Empty;
}
