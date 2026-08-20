using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PomodoroClocker.Core.Entities;
using PomodoroClocker.Core.Interfaces;

namespace PomodoroClocker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ISessionRepository _sessionRepository;

    public SessionsController(
        ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession(
        [FromBody] PomodoroSession session)
    {
        try
        {
            var userId = GetCurrentUserId();

            session.UserId = userId;

            await _sessionRepository.AddAsync(session);
            await _sessionRepository.SaveChangesAsync();

            return Ok(session);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = ex.Message,
                innerException = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMySessions()
    {
        var userId = GetCurrentUserId();

        var sessions =
            await _sessionRepository.GetByUserIdAsync(userId);

        return Ok(sessions);
    }

    private int GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            throw new UnauthorizedAccessException(
                "User ID is missing from JWT.");
        }

        if (!int.TryParse(
                userIdClaim.Value,
                out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user ID in JWT.");
        }

        return userId;
    }
}