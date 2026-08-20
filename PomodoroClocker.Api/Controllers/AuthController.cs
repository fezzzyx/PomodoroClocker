using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PomodoroClocker.Api.Services;
using PomodoroClocker.Core.DTOs;
using PomodoroClocker.Core.Entities;
using PomodoroClocker.Infrastructure.Data;

namespace PomodoroClocker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PomodoroDbContext _context;
    private readonly JwtService _jwtService;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthController(
        PomodoroDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = new PasswordHasher<User>();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Username and password are required.");
        }

        if (dto.Password.Length < 6)
        {
            return BadRequest(
                "Password must contain at least 6 characters.");
        }

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(
                x => x.Username == dto.Username);

        if (existingUser != null)
        {
            return Conflict("Username already exists.");
        }

        var user = new User
        {
            Username = dto.Username
        };

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                dto.Password);

        user.Settings = new UserSettings();

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            token,
            username = user.Username,
            userId = user.Id
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(
                x => x.Username == dto.Username);

        if (user == null)
        {
            return Unauthorized("Invalid username or password.");
        }

        var result =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid username or password.");
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            token,
            username = user.Username,
            userId = user.Id
        });
    }
}