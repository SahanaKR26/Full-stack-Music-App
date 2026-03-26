using Microsoft.AspNetCore.Mvc;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview()
    {
        var totalUsers = await _context.Users.CountAsync(u => u.Role != "Admin");
        var totalSongs = await _context.Songs.CountAsync();
        var totalArtists = await _context.Artists.CountAsync();
        var totalPlaylists = await _context.Playlists.CountAsync();
        var totalPlays = await _context.Songs.SumAsync(s => (long)s.PlayCount);
        var premiumUsers = await _context.Users.CountAsync(u => u.SubscriptionPlan != "Free" && u.Role != "Admin");

        return Ok(new
        {
            totalUsers,
            totalSongs,
            totalArtists,
            totalPlaylists,
            totalPlays,
            premiumUsers
        });
    }

    [HttpGet("top-songs")]
    public async Task<IActionResult> TopSongs([FromQuery] int limit = 10)
    {
        var songs = await _context.Songs
            .OrderByDescending(s => s.PlayCount)
            .Take(limit)
            .Select(s => new { s.Id, s.Title, s.Artist, s.Genre, s.PlayCount, s.AlbumArtPath })
            .ToListAsync();
        return Ok(songs);
    }

    [HttpGet("top-artists")]
    public async Task<IActionResult> TopArtists([FromQuery] int limit = 10)
    {
        var artists = await _context.Artists
            .Select(a => new
            {
                a.Id, a.Name, a.ImagePath,
                TotalPlays = a.Songs.Sum(s => s.PlayCount),
                SongCount = a.Songs.Count
            })
            .OrderByDescending(a => a.TotalPlays)
            .Take(limit)
            .ToListAsync();
        return Ok(artists);
    }

    [HttpGet("genre-breakdown")]
    public async Task<IActionResult> GenreBreakdown()
    {
        var genres = await _context.Songs
            .Where(s => s.Genre != string.Empty)
            .GroupBy(s => s.Genre)
            .Select(g => new { Genre = g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .ToListAsync();
        return Ok(genres);
    }

    [HttpGet("recent-plays")]
    public async Task<IActionResult> RecentPlays([FromQuery] int days = 7)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);
        var data = await _context.RecentlyPlayed
            .Where(rp => rp.PlayedAt >= cutoff)
            .GroupBy(rp => rp.PlayedAt.Date)
            .Select(g => new { Date = g.Key.ToString("yyyy-MM-dd"), Plays = g.Count() })
            .OrderBy(g => g.Date)
            .ToListAsync();
        return Ok(data);
    }
}
