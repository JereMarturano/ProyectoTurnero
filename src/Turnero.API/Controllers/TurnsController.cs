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

    public TurnsController(TurneroDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Turn>>> GetTurns()
    {
        return await _context.Turns
            .Include(t => t.Doctor)
            .Include(t => t.Patient)
            .ToListAsync();
    }

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

    [HttpPost]
    public async Task<ActionResult<Turn>> CreateTurn(Turn turn)
    {
        // 1. Handle Patient Logic
        if (!string.IsNullOrEmpty(turn.PatientDni))
        {
            var existingPatient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Dni == turn.PatientDni);

            if (existingPatient != null)
            {
                // Link to existing patient
                turn.Patient = existingPatient;
                
                // Optional: Update patient details if provided in the turn
                if (!string.IsNullOrEmpty(turn.PatientName)) existingPatient.Name = turn.PatientName;
                if (!string.IsNullOrEmpty(turn.PatientSurname)) existingPatient.Surname = turn.PatientSurname;
                if (!string.IsNullOrEmpty(turn.PatientEmail)) existingPatient.Email = turn.PatientEmail;
                if (!string.IsNullOrEmpty(turn.PatientPhone)) existingPatient.Phone = turn.PatientPhone;
            }
            else
            {
                // Create new patient
                var newPatient = new Patient
                {
                    Name = turn.PatientName ?? string.Empty,
                    Surname = turn.PatientSurname ?? string.Empty,
                    Dni = turn.PatientDni,
                    Sex = turn.PatientSex,
                    Email = turn.PatientEmail,
                    Phone = turn.PatientPhone
                };
                // We don't need to add it explicitly if we set turn.Patient = newPatient, EF tracks it.
                // But adding it explicitly is fine too.
                turn.Patient = newPatient;
            }
        }

        turn.Timestamp = DateTime.Now; // Use local server time
        
        if (turn.Date.HasValue && !string.IsNullOrEmpty(turn.Time))
        {
            // Combine Date and Time so the Date column shows the correct appointment time
            if (TimeSpan.TryParse(turn.Time, out var timeSpan))
            {
                turn.Date = turn.Date.Value.Date.Add(timeSpan);
            }
        }
        
        if (turn.Status == 0) turn.Status = TurnStatus.Waiting; // Default to Waiting

        _context.Turns.Add(turn);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTurn), new { id = turn.Id }, turn);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTurn(int id, Turn turn)
    {
        if (id != turn.Id)
        {
            return BadRequest();
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

    [HttpPost("call")]
    public async Task<ActionResult<Turn>> CallNextTurn()
    {
        // Logic: Find the oldest 'Waiting' turn for today.
        var today = DateTime.Now.Date;
        var nextTurn = await _context.Turns
            .Include(t => t.Patient)
            .Include(t => t.Doctor)
            .Where(t => t.Status == TurnStatus.Waiting && t.Date.HasValue && t.Date.Value.Date == today)
            .OrderBy(t => t.Date) // Order by appointment time
            .FirstOrDefaultAsync();

        if (nextTurn == null)
        {
            return NotFound("No hay turnos en espera para hoy.");
        }

        nextTurn.Status = TurnStatus.Called;
        await _context.SaveChangesAsync();

        return nextTurn;
    }

    [HttpPost("finish")]
    public async Task<ActionResult<Turn>> FinishTurn()
    {
        // Find the turn that is currently 'Called'.
        var currentTurn = await _context.Turns
            .Where(t => t.Status == TurnStatus.Called)
            .OrderByDescending(t => t.Date)
            .FirstOrDefaultAsync();

        if (currentTurn == null)
        {
            return NotFound("No hay turnos en atención.");
        }

        currentTurn.Status = TurnStatus.Finished;
        await _context.SaveChangesAsync();

        return currentTurn;
    }

    [HttpGet("status")]
    public async Task<ActionResult<Turn>> GetCurrentStatus()
    {
        // Return the turn currently being called.
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
}
