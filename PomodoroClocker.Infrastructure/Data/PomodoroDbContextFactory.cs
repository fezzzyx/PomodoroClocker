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

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=pomodoro;Username=postgres;Password=password0001");

        return new PomodoroDbContext(
            optionsBuilder.Options);
    }
}