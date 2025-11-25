
namespace Turnero.Core;

public class Turn
{
    public int Id { get; set; }
    public int Number { get; set; }
    public DateTime Timestamp { get; set; }
    public TurnStatus Status { get; set; }

    // Booking fields
    public int? DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    public int? PatientId { get; set; }
    public Patient? Patient { get; set; }

    public DateTime? Date { get; set; }
    public string? Time { get; set; }
    
    // Grouped Patient Info
    public string? PatientName { get; set; }
    public string? PatientSurname { get; set; }
    public string? PatientDni { get; set; }
    public string? PatientSex { get; set; }
    public string? PatientEmail { get; set; }
    public string? PatientPhone { get; set; }
}

public enum TurnStatus
{
    Waiting,
    Called,
    Finished
}
