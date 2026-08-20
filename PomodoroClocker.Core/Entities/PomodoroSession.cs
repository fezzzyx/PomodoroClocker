using PomodoroClocker.Core.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace PomodoroClocker.Core.Entities;

public class PomodoroSession : BaseEntity
{
    public SessionType SessionType { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public bool IsCompleted { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }
}