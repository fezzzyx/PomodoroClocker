using Microsoft.EntityFrameworkCore;
using PomodoroClocker.Core.Entities;

namespace PomodoroClocker.Infrastructure.Data;

public class PomodoroDbContext : DbContext
{
    public PomodoroDbContext(DbContextOptions<PomodoroDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    public DbSet<PomodoroSession> PomodoroSessions => Set<PomodoroSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(u => u.PasswordHash)
                .IsRequired();
        });

        modelBuilder.Entity<UserSettings>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.Property(s => s.WorkMinutes)
                .HasDefaultValue(25);

            entity.Property(s => s.ShortBreakMinutes)
                .HasDefaultValue(5);

            entity.Property(s => s.LongBreakMinutes)
                .HasDefaultValue(15);

            entity.Property(s => s.CyclesBeforeLongBreak)
                .HasDefaultValue(4);

            entity.HasOne(s => s.User)
                .WithOne(u => u.Settings)
                .HasForeignKey<UserSettings>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PomodoroSession>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.Property(s => s.SessionType)
                .IsRequired();

            entity.Property(s => s.StartTime)
                .IsRequired();

            entity.Property(s => s.EndTime)
                .IsRequired();

            entity.Property(s => s.IsCompleted)
                .IsRequired();

            entity.HasOne(s => s.User)
                .WithMany(u => u.Sessions)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}