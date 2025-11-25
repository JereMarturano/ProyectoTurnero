using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Turnero.Core;

public class Doctor
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Specialty { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;

    public ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();
    public ICollection<Turn> Turns { get; set; } = new List<Turn>();
}
