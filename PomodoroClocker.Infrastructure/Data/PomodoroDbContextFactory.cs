using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PomodoroClocker.Infrastructure.Data;

public class PomodoroDbContextFactory
    : IDesignTimeDbContextFactory<PomodoroDbContext>
{
    public PomodoroDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder =
            new DbContextOptionsBuilder<PomodoroDbContext>();

        optionsBuilder.UseSqlite("Data Source=pomodoro.db");

        return new PomodoroDbContext(optionsBuilder.Options);
    }
}