
using System.ComponentModel.DataAnnotations;

namespace Turnero.Core;

public class Turn
{
    public int Id { get; set; }
    public int Number { get; set; }
    public DateTime Timestamp { get; set; }
    public TurnStatus Status { get; set; }

    // Booking fields
    [Required(ErrorMessage = "El Doctor es obligatorio")]
    public int? DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public int? PatientId { get; set; }
    public Patient? Patient { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria")]
    public DateTime? Date { get; set; }
    
    [Required(ErrorMessage = "La hora es obligatoria")]
    public string? Time { get; set; }
    
    // Grouped Patient Info
    public string? PatientName { get; set; }
    public string? PatientSurname { get; set; }
    
    [Required(ErrorMessage = "El DNI del paciente es obligatorio")]
    [StringLength(8, MinimumLength = 7, ErrorMessage = "El DNI debe tener entre 7 y 8 caracteres")]
    public string? PatientDni { get; set; }
    
    public string? PatientSex { get; set; }
    
    [EmailAddress(ErrorMessage = "El email no es válido")]
    public string? PatientEmail { get; set; }
    
    [Phone(ErrorMessage = "El teléfono no es válido")]
    public string? PatientPhone { get; set; }
}

public enum TurnStatus
{
    Waiting,
    Called,
    Finished
}
