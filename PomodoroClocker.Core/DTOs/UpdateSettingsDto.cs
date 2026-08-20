using System;
using System.Collections.Generic;
using System.Text;

namespace PomodoroClocker.Core.DTOs;

public class UpdateSettingsDto
{
    public int WorkMinutes { get; set; }

    public int ShortBreakMinutes { get; set; }

    public int LongBreakMinutes { get; set; }

    public int CyclesBeforeLongBreak { get; set; }
}