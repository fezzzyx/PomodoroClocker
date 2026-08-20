using Microsoft.EntityFrameworkCore;
using PomodoroClocker.Core.Entities;
using PomodoroClocker.Core.Interfaces;
using PomodoroClocker.Infrastructure.Data;

namespace PomodoroClocker.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly PomodoroDbContext _context;

    public UserRepository(PomodoroDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Settings)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users
            .Include(u => u.Settings)
            .FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}