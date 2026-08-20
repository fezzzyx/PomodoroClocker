using System;
using System.Collections.Generic;
using System.Text;

namespace PomodoroClocker.Core.Entities;

public class UserSettings : BaseEntity
{
    public int WorkMinutes { get; set; } = 25;

    public int ShortBreakMinutes { get; set; } = 5;

    public int LongBreakMinutes { get; set; } = 15;

    public int CyclesBeforeLongBreak { get; set; } = 4;

    public int UserId { get; set; }

    public User? User { get; set; }
}