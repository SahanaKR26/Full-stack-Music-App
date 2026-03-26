using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _env;

    public AuthController(AppDbContext context, IConfiguration configuration, IWebHostEnvironment env)
    {
        _context = context;
        _configuration = configuration;
        _env = env;
    }

    /// <summary>
    /// Create the first admin user (local/setup only). Only works in Development and when no admin exists.
    /// POST api/auth/create-admin with JSON body: { "username": "admin", "password": "YourPassword" }
    /// </summary>
    [HttpPost("create-admin")]
    public IActionResult CreateAdmin([FromBody] UserDto request)
    {
        if (!_env.IsDevelopment())
            return BadRequest("Create admin is only available in Development.");
        if (_context.Users.Any(u => u.Role == "Admin"))
            return BadRequest("An admin user already exists.");
        if (_context.Users.Any(u => u.Username == request.Username))
            return BadRequest("Username already taken.");
        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Admin",
            SubscriptionPlan = "Free"
        };
        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok(new { message = "Admin user created. You can now log in with this username and password." });
    }

    /// <summary>
    /// Change an existing admin's password (Development only). Use when you forgot admin password or want to set a new one.
    /// POST api/auth/change-admin-password with JSON: { "username": "admin", "newPassword": "YourNewPassword" }
    /// </summary>
    [HttpPost("change-admin-password")]
    public IActionResult ChangeAdminPassword([FromBody] ChangeAdminPasswordDto request)
    {
        if (!_env.IsDevelopment())
            return BadRequest("Change admin password is only available in Development.");
        var user = _context.Users.FirstOrDefault(u => u.Username == request.Username && u.Role == "Admin");
        if (user == null)
            return BadRequest("Admin user not found or username is not an admin.");
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 4)
            return BadRequest("New password must be at least 4 characters.");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _context.SaveChanges();
        return Ok(new { message = "Admin password updated. Log in with the new password." });
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] UserDto request)
    {
        if (_context.Users.Any(u => u.Username == request.Username))
        {
            return BadRequest("Username already exists.");
        }

        // Admins can only be created directly in the database — registration always creates a User.
        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "User",
            SubscriptionPlan = "Free"
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] UserDto request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid credentials.");
        }

        var token = GenerateJwt(user);
        return Ok(new { 
            token, 
            userId = user.Id, 
            username = user.Username,
            role = user.Role,
            subscriptionPlan = user.SubscriptionPlan
        });
    }

    private string GenerateJwt(User user)
    {
        var jwtKey = _configuration["JwtSettings:Key"];
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey!));
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("SubscriptionPlan", user.SubscriptionPlan)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class UserDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ChangeAdminPasswordDto
{
    public string Username { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
