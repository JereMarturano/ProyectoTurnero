using System.Collections.Generic;

using System.ComponentModel.DataAnnotations;

namespace Turnero.Core;

public class Patient
{
    public int Id { get; set; }
    
    [Required(ErrorMessage = "El nombre es obligatorio")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El apellido es obligatorio")]
    public string Surname { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "El DNI es obligatorio")]
    [StringLength(8, MinimumLength = 7, ErrorMessage = "El DNI debe tener entre 7 y 8 caracteres")]
    public string Dni { get; set; } = string.Empty;
    
    public string? Sex { get; set; }
    
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string? Email { get; set; }
    
    [Phone(ErrorMessage = "El teléfono no es válido")]
    public string? Phone { get; set; }

    public ICollection<Turn> Turns { get; set; } = new List<Turn>();
}
