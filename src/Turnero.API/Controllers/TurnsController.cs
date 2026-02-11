using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turnero.Core;
using Turnero.Infrastructure;

namespace Turnero.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TurnsController : ControllerBase
{
    private readonly TurneroDbContext _context;

    // Constructor: Aquí inyectamos directamente el DbContext.
    // Nota: En arquitecturas más grandes, esta lógica se movería a un "TurnService", 
    // pero hacerlo aquí es válido para aprender cómo manipular datos complejos.
    public TurnsController(TurneroDbContext context)
    {
        _context = context;
    }

    // GET: api/turns
    // Obtiene TODOS los turnos históricos y futuros.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Turn>>> GetTurns()
    {
        return await _context.Turns
            .Include(t => t.Doctor)  // Trae los datos del médico asociado (JOIN)
            .Include(t => t.Patient) // Trae los datos del paciente asociado (JOIN)
            .ToListAsync();
    }

    // GET: api/turns/5
    // Obtiene un turno específico por ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<Turn>> GetTurn(int id)
    {
        var turn = await _context.Turns
            .Include(t => t.Doctor)
            .Include(t => t.Patient)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (turn == null)
        {
            return NotFound();
        }

        return turn;
    }

    // POST: api/turns
    // CREACIÓN DE TURNO (El método más complejo)
    // Maneja: Validación de fecha, verificación de doctor, y creación/actualización automática de paciente.
    [HttpPost]
    public async Task<ActionResult<Turn>> CreateTurn(Turn turn)
    {
        // 1. Validaciones básicas del modelo (campos requeridos, tipos de datos)
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 2. Validar que el médico exista
        var doctor = await _context.Doctors.FindAsync(turn.DoctorId);
        if (doctor == null)
        {
            return BadRequest("El médico especificado no existe.");
        }

        // 3. Validar Fecha y Hora
        if (!turn.Date.HasValue || string.IsNullOrEmpty(turn.Time))
        {
            return BadRequest("Fecha y hora son obligatorias.");
        }

        // Combinamos la Fecha (Date) con la Hora (string "HH:mm") para crear un DateTime completo
        if (TimeSpan.TryParse(turn.Time, out var timeSpan))
        {
            var appointmentDate = turn.Date.Value.Date.Add(timeSpan);

            // Regla de negocio: No se puede reservar en el pasado
            if (appointmentDate < DateTime.Now)
            {
                return BadRequest("No se puede reservar un turno en el pasado.");
            }
            turn.Date = appointmentDate; // Guardamos la fecha combinada exacta
        }
        else
        {
            return BadRequest("Formato de hora inválido.");
        }

        // 4. Verificación de CONCURRENCIA (Overlapping)
        // Revisamos si el médico ya tiene OTRO turno ese mismo día a esa misma hora.
        var isBooked = await _context.Turns.AnyAsync(t =>
            t.DoctorId == turn.DoctorId &&
            t.Date == turn.Date
        );

        if (isBooked)
        {
            return Conflict("El médico ya tiene un turno asignado en ese horario.");
        }

        // 5. Lógica de Paciente (UPSERT: Update or Insert)
        // Si mandan un DNI, verificamos si el paciente ya existe en nuestra base de datos.
        if (!string.IsNullOrEmpty(turn.PatientDni))
        {
            var existingPatient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Dni == turn.PatientDni);

            if (existingPatient != null)
            {
                // CASO A: El paciente ya existe.
                // Asociamos el turno a este paciente existente.
                turn.Patient = existingPatient;

                // Opcional: Actualizamos sus datos si vinieron nuevos en el formulario
                if (!string.IsNullOrEmpty(turn.PatientName)) existingPatient.Name = turn.PatientName;
                if (!string.IsNullOrEmpty(turn.PatientSurname)) existingPatient.Surname = turn.PatientSurname;
                if (!string.IsNullOrEmpty(turn.PatientEmail)) existingPatient.Email = turn.PatientEmail;
                if (!string.IsNullOrEmpty(turn.PatientPhone)) existingPatient.Phone = turn.PatientPhone;
            }
            else
            {
                // CASO B: Es un paciente nuevo.
                // Creamos un nuevo objeto Paciente con los datos del formulario.
                var newPatient = new Patient
                {
                    Name = turn.PatientName ?? string.Empty,
                    Surname = turn.PatientSurname ?? string.Empty,
                    Dni = turn.PatientDni,
                    Sex = turn.PatientSex,
                    Email = turn.PatientEmail,
                    Phone = turn.PatientPhone
                };
                turn.Patient = newPatient; // Entity Framework guardará el paciente y el turno juntos.
            }
        }

        turn.Timestamp = DateTime.Now; // Fecha de creación del registro

        if (turn.Status == 0) turn.Status = TurnStatus.Waiting; // Estado inicial por defecto

        _context.Turns.Add(turn);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTurn), new { id = turn.Id }, turn);
    }

    // PUT: api/turns/5
    // Actualización genérica de turno
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTurn(int id, Turn turn)
    {
        if (id != turn.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _context.Entry(turn).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TurnExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/turns/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTurn(int id)
    {
        var turn = await _context.Turns.FindAsync(id);
        if (turn == null)
        {
            return NotFound();
        }

        _context.Turns.Remove(turn);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TurnExists(int id)
    {
        return _context.Turns.Any(e => e.Id == id);
    }

    // --- MÉTODOS DE FLUJO DE ATENCIÓN (STATE MACHINE) ---

    // POST: api/turns/call
    // Llama al siguiente paciente que esté esperando HOY.
    [HttpPost("call")]
    public async Task<ActionResult<Turn>> CallNextTurn()
    {
        var today = DateTime.Now.Date;

        // Buscamos el turno más antiguo (OrderBy date) que esté "Waiting" y sea de hoy.
        var nextTurn = await _context.Turns
            .Include(t => t.Patient)
            .Include(t => t.Doctor)
            .Where(t => t.Status == TurnStatus.Waiting && t.Date.HasValue && t.Date.Value.Date == today)
            .OrderBy(t => t.Date)
            .FirstOrDefaultAsync();

        if (nextTurn == null)
        {
            return NotFound("No hay turnos en espera para hoy.");
        }

        // Cambiamos estado a "Called" (Llamado/Atendiendo)
        nextTurn.Status = TurnStatus.Called;
        await _context.SaveChangesAsync();

        return nextTurn;
    }

    // POST: api/turns/finish
    // Finaliza el turno actual.
    [HttpPost("finish")]
    public async Task<ActionResult<Turn>> FinishTurn()
    {
        // Buscamos cuál es el turno que está siendo atendido ahora mismo.
        var currentTurn = await _context.Turns
            .Where(t => t.Status == TurnStatus.Called)
            .OrderByDescending(t => t.Date)
            .FirstOrDefaultAsync();

        if (currentTurn == null)
        {
            return NotFound("No hay turnos en atención.");
        }

        // Lo marcamos como terminado
        currentTurn.Status = TurnStatus.Finished;
        await _context.SaveChangesAsync();

        return currentTurn;
    }

    // GET: api/turns/status
    // Obtiene qué turno se está atendiendo AHORA (Para mostrar en monitores en la sala de espera).
    [HttpGet("status")]
    public async Task<ActionResult<Turn>> GetCurrentStatus()
    {
        var currentTurn = await _context.Turns
            .Include(t => t.Patient)
            .Include(t => t.Doctor)
            .Where(t => t.Status == TurnStatus.Called)
            .OrderByDescending(t => t.Date)
            .FirstOrDefaultAsync();

        if (currentTurn == null)
        {
            return NoContent();
        }

        return currentTurn;
    }

    // POST: api/turns/next
    // Devuelve info del próximo turno en la cola PERO SIN LLAMARLO (solo lectura).
    // Nota: Aunque es solo lectura, está marcado como POST, probablemente debería ser GET.
    [HttpPost("next")]
    public async Task<ActionResult<Turn>> GetNextTurnInfo()
    {
        var today = DateTime.Now.Date;
        var nextTurn = await _context.Turns
           .Include(t => t.Patient)
           .Include(t => t.Doctor)
           .Where(t => t.Status == TurnStatus.Waiting && t.Date.HasValue && t.Date.Value.Date == today)
           .OrderBy(t => t.Date)
           .FirstOrDefaultAsync();

        if (nextTurn == null) return NoContent();
        return nextTurn;
    }

    // GET: api/turns/stats
    // Estadísticas simples para dashboard: Cuántos atendidos y cuántos pendientes hoy.
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDailyStats()
    {
        var today = DateTime.Now.Date;

        var attended = await _context.Turns
            .CountAsync(t => t.Status == TurnStatus.Finished && t.Date.HasValue && t.Date.Value.Date == today);

        var pending = await _context.Turns
            .CountAsync(t => t.Status == TurnStatus.Waiting && t.Date.HasValue && t.Date.Value.Date == today);

        return new { attended, pending };
    }

    // GET: api/turns/history/12345678
    // Historial clínico: Turnos pasados (Finalizados) de un paciente por DNI.
    [HttpGet("history/{dni}")]
    public async Task<ActionResult<IEnumerable<Turn>>> GetPatientHistory(string dni)
    {
        return await _context.Turns
            .Include(t => t.Doctor)
            .Where(t => t.PatientDni == dni && t.Status == TurnStatus.Finished)
            .OrderByDescending(t => t.Date) // Los más recientes primero
            .ToListAsync();
    }
}