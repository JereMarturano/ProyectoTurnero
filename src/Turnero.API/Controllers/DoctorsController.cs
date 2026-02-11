using Microsoft.AspNetCore.Mvc;
using Turnero.Application.Services;
using Turnero.Core;

namespace Turnero.API.Controllers;

// [ApiController]: Habilita comportamientos automáticos de API (como validación de modelos).
// [Route]: Define la ruta base. Será: http://localhost:puerto/api/doctors
[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly DoctorService _doctorService;

    // Constructor: Inyectamos el servicio de lógica de negocio (DoctorService).
    // El controlador NO debe saber cómo calcular turnos, solo a quién pedirle los datos.
    public DoctorsController(DoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    // GET: api/doctors
    // Obtiene la lista completa de doctores.
    [HttpGet]
    public async Task<ActionResult<List<Doctor>>> GetDoctors()
    {
        // await: Espera a que la base de datos responda sin bloquear el servidor.
        return await _doctorService.GetDoctors();
    }

    // GET: api/doctors/5/slots?date=2023-10-27
    // Este endpoint es interesante porque combina dos tipos de parámetros:
    // 1. {doctorId}: Viene en la RUTA (Route Parameter). Identifica al recurso.
    // 2. [FromQuery] date: Viene después del signo ? en la URL (Query String). Sirve para filtrar.
    [HttpGet("{doctorId}/slots")]
    public async Task<ActionResult<List<string>>> GetAvailableSlots(int doctorId, [FromQuery] DateTime date)
    {
        // Llama al servicio pasando el ID del médico y la fecha elegida
        // Devuelve la lista de horarios disponibles (ej: ["10:00", "10:30"])
        return await _doctorService.GetAvailableSlots(doctorId, date);
    }
}