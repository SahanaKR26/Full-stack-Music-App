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
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var favorites = await _context.FavoriteSongs
            .Where(f => f.UserId == userId)
            .Include(f => f.Song)
            .Select(f => f.Song)
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost("{songId}")]
    public async Task<IActionResult> AddFavorite(int songId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        if (await _context.FavoriteSongs.AnyAsync(f => f.UserId == userId && f.SongId == songId))
        {
            return BadRequest("Song already in favorites");
        }

        var favorite = new FavoriteSong { UserId = userId, SongId = songId };
        _context.FavoriteSongs.Add(favorite);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Added to favorites" });
    }

    [HttpDelete("{songId}")]
    public async Task<IActionResult> RemoveFavorite(int songId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

        var favorite = await _context.FavoriteSongs
            .FirstOrDefaultAsync(f => f.UserId == userId && f.SongId == songId);

        if (favorite == null) return NotFound();

        _context.FavoriteSongs.Remove(favorite);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Removed from favorites" });
    }
}
