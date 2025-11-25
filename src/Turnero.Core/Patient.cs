using System.Collections.Generic;

namespace Turnero.Core;

public class Patient
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string? Sex { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    public ICollection<Turn> Turns { get; set; } = new List<Turn>();
}
