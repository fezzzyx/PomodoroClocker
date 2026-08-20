using System;
using System.Collections.Generic;
using System.Text;

namespace PomodoroClocker.Core.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserSettings? Settings { get; set; }

    public ICollection<PomodoroSession> Sessions { get; set; } = new List<PomodoroSession>();
}
