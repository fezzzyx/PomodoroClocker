using PomodoroClocker.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace PomodoroClocker.Core.Interfaces;

public interface ISessionRepository
{
    Task<List<PomodoroSession>> GetByUserIdAsync(int userId);

    Task AddAsync(PomodoroSession session);

    Task SaveChangesAsync();
}
