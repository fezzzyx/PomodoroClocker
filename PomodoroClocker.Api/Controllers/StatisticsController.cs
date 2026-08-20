using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PomodoroClocker.Core.Enums;
using PomodoroClocker.Infrastructure.Data;

namespace PomodoroClocker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class StatisticsController : ControllerBase
{
    private readonly PomodoroDbContext _context;

    public StatisticsController(PomodoroDbContext context)
    {
        _context = context;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetStatistics()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized();
        }

        var sessions = await _context.PomodoroSessions
            .Where(x =>
                x.UserId == userId &&
                x.IsCompleted &&
                x.SessionType == SessionType.Work)
            .ToListAsync();

        var totalPomodoros = sessions.Count;

        var totalFocusMinutes = sessions.Sum(x =>
            (int)(x.EndTime - x.StartTime).TotalMinutes);

        var today = DateTime.Today;

        var daysSinceMonday =
            ((int)today.DayOfWeek + 6) % 7;

        var monday =
            today.AddDays(-daysSinceMonday);

        var weeklyData = Enumerable
            .Range(0, 7)
            .Select(offset =>
            {
                var date =
                    monday.AddDays(offset);

                var count =
                    sessions.Count(session =>
                        session.StartTime.Date ==
                        date.Date);

                return new
                {
                    day = date.ToString("ddd"),
                    count
                };
            })
            .ToList();

        return Ok(new
        {
            totalPomodoros,
            totalFocusMinutes,
            weeklyData
        });
    }

}