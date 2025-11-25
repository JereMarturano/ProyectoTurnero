using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Turnero.Core;

public class Schedule
{
    public int Id { get; set; }

    public int DoctorId { get; set; }
    
    [ForeignKey("DoctorId")]
    public Doctor? Doctor { get; set; }

    public DayOfWeek DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public int DurationMinutes { get; set; }
}
