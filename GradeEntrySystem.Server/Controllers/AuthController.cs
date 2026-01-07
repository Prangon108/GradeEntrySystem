using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using GradeEntrySystem.Server.Data;
using GradeEntrySystem.Server.Models;
using GradeEntrySystem.Server.Services;

namespace GradeEntrySystem.Server.Controllers;

/// <summary>
/// Authentication endpoints for login and registration.
/// Issues JWT tokens on successful authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>Authenticate by username/email and password; returns JWT.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Username);

        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = GenerateJwtToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            Username = user.Username,
            Role = user.Role
        });
    }

    /// <summary>Register a new user  and return JWT.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
        {
            return BadRequest(new { message = "Username or email already exists" });
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = request.Role ?? "Teacher"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            Username = user.Username,
            Role = user.Role
        });
    }

    /// <summary>Create a signed JWT token with basic identity claims.</summary>
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var expirationMinutes = int.Parse(jwtSettings["ExpirationInMinutes"] ?? "60");
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
