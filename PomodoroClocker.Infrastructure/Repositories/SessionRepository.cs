using Microsoft.EntityFrameworkCore;
using PomodoroClocker.Core.Entities;
using PomodoroClocker.Core.Interfaces;
using PomodoroClocker.Infrastructure.Data;

namespace PomodoroClocker.Infrastructure.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly PomodoroDbContext _context;

    public SessionRepository(PomodoroDbContext context)
    {
        _context = context;
    }

    public async Task<List<PomodoroSession>> GetByUserIdAsync(int userId)
    {
        return await _context.PomodoroSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartTime)
            .ToListAsync();
    }

    public async Task AddAsync(PomodoroSession session)
    {
        await _context.PomodoroSessions.AddAsync(session);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}