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
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public UsersController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // --- Own Profile ---
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(new
        {
            user.Id, user.Username, user.Email,
            user.ProfileImagePath, user.Role,
            user.SubscriptionPlan, user.LastLoginAt
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest("Current password is incorrect.");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profile updated", user.Email });
    }

    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file");
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var dir = Path.Combine(_env.WebRootPath ?? "wwwroot", "Uploads", "Avatars");
        Directory.CreateDirectory(dir);
        var fileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        await using var stream = new FileStream(Path.Combine(dir, fileName), FileMode.Create);
        await file.CopyToAsync(stream);
        user.ProfileImagePath = $"/Uploads/Avatars/{fileName}";
        await _context.SaveChangesAsync();
        return Ok(new { avatarUrl = user.ProfileImagePath });
    }

    // --- Recently Played ---
    [HttpGet("me/recently-played")]
    public async Task<IActionResult> GetRecentlyPlayed()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();
        var songs = await _context.RecentlyPlayed
            .Where(rp => rp.UserId == userId)
            .OrderByDescending(rp => rp.PlayedAt)
            .Take(20)
            .Include(rp => rp.Song)
            .Select(rp => rp.Song)
            .ToListAsync();
        return Ok(songs);
    }

    // --- Plan Upgrade ---
    [HttpPost("upgrade")]
    public async Task<IActionResult> UpgradePlan([FromBody] UpgradePlanDto request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdString, out int userId)) return Unauthorized();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();
        if (request.Plan != "Premium" && request.Plan != "Pro")
            return BadRequest("Invalid plan selected");
        user.SubscriptionPlan = request.Plan;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Upgraded to {request.Plan}!", newPlan = request.Plan });
    }

    // --- Admin Endpoints ---
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Where(u => u.Role != "Admin")
            .Select(u => new
            {
                u.Id, u.Username, u.Email, u.Role,
                u.SubscriptionPlan, u.IsBlocked, u.LastLoginAt,
                u.ProfileImagePath
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost("{id}/block")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleBlock(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsBlocked = !user.IsBlocked;
        await _context.SaveChangesAsync();
        return Ok(new { message = user.IsBlocked ? "User blocked" : "User unblocked", isBlocked = user.IsBlocked });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "User deleted" });
    }
}

public class UpdateProfileDto
{
    public string? Email { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}

public class UpgradePlanDto
{
    public string Plan { get; set; } = string.Empty;
}
