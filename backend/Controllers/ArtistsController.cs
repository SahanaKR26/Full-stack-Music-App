using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ArtistsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ArtistsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Artists.OrderBy(a => a.Name).ToListAsync());

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var artist = await _context.Artists
            .Include(a => a.Songs)
            .Include(a => a.Albums)
            .FirstOrDefaultAsync(a => a.Id == id);
        return artist == null ? NotFound() : Ok(artist);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] ArtistDto dto)
    {
        var artist = new Artist
        {
            Name = dto.Name,
            Bio = dto.Bio ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.Image != null)
        {
            var dir = Path.Combine(_env.WebRootPath, "Uploads", "Artists");
            Directory.CreateDirectory(dir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var path = Path.Combine(dir, fileName);
            await using var stream = new FileStream(path, FileMode.Create);
            await dto.Image.CopyToAsync(stream);
            artist.ImagePath = $"/Uploads/Artists/{fileName}";
        }

        _context.Artists.Add(artist);
        await _context.SaveChangesAsync();
        return Ok(artist);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromForm] ArtistDto dto)
    {
        var artist = await _context.Artists.FindAsync(id);
        if (artist == null) return NotFound();

        artist.Name = dto.Name;
        artist.Bio = dto.Bio ?? string.Empty;

        if (dto.Image != null)
        {
            var dir = Path.Combine(_env.WebRootPath, "Uploads", "Artists");
            Directory.CreateDirectory(dir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var path = Path.Combine(dir, fileName);
            await using var stream = new FileStream(path, FileMode.Create);
            await dto.Image.CopyToAsync(stream);
            artist.ImagePath = $"/Uploads/Artists/{fileName}";
        }

        await _context.SaveChangesAsync();
        return Ok(artist);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var artist = await _context.Artists.FindAsync(id);
        if (artist == null) return NotFound();
        _context.Artists.Remove(artist);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Artist deleted" });
    }
}

public class ArtistDto
{
    public string Name { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public IFormFile? Image { get; set; }
}
