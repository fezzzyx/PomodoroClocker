using Microsoft.AspNetCore.Mvc;
using PomodoroClocker.Core.Entities;
using PomodoroClocker.Core.Interfaces;

namespace PomodoroClocker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(
    [FromBody] User user)
    {
        try
        {
            user.Settings = new UserSettings();

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return Ok(user);
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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }
}