using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PomodoroClocker.Core.DTOs;
using PomodoroClocker.Core.Entities;
using PomodoroClocker.Infrastructure.Data;
using System.Security.Claims;

namespace PomodoroClocker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/settings")]
public class UsersSettingsController : ControllerBase
{
    private readonly PomodoroDbContext _context;

    public UsersSettingsController(PomodoroDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var userId = GetCurrentUserId();

        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (settings == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            settings.Id,
            settings.WorkMinutes,
            settings.ShortBreakMinutes,
            settings.LongBreakMinutes,
            settings.CyclesBeforeLongBreak,
            settings.UserId
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings(
        [FromBody] UpdateSettingsDto dto)
    {
        var userId = GetCurrentUserId();

        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (settings == null)
        {
            return NotFound();
        }

        settings.WorkMinutes = dto.WorkMinutes;
        settings.ShortBreakMinutes = dto.ShortBreakMinutes;
        settings.LongBreakMinutes = dto.LongBreakMinutes;
        settings.CyclesBeforeLongBreak =
            dto.CyclesBeforeLongBreak;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            settings.Id,
            settings.WorkMinutes,
            settings.ShortBreakMinutes,
            settings.LongBreakMinutes,
            settings.CyclesBeforeLongBreak,
            settings.UserId
        });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "User ID is missing from JWT.");
        }

        return userId;
    }
}