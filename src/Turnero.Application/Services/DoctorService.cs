using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnero.Core;
using Turnero.Infrastructure;

namespace Turnero.Application.Services;

/// <summary>
/// Servicio encargado de la lógica de negocio relacionada con Doctores y sus Agendas.
/// </summary>
public class DoctorService
{
    private readonly TurneroDbContext _context;

    // Constructor: Inyección de dependencia del contexto de la base de datos
    public DoctorService(TurneroDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene la lista completa de doctores, incluyendo sus configuraciones de horarios (Schedules).
    /// </summary>
    public async Task<List<Doctor>> GetDoctors()
    {
        // .Include(d => d.Schedules) es vital para hacer una carga "Eager" (ansiosa) 
        // y traer los datos relacionados en una sola consulta.
        return await _context.Doctors.Include(d => d.Schedules).ToListAsync();
    }

    /// <summary>
    /// Calcula los bloques de horarios disponibles (slots) para un doctor en una fecha específica.
    /// </summary>
    /// <param name="doctorId">ID del doctor.</param>
    /// <param name="date">Fecha para consultar disponibilidad.</param>
    /// <returns>Lista de strings con los horarios disponibles (ej: "10:00", "10:30").</returns>
    public async Task<List<string>> GetAvailableSlots(int doctorId, DateTime date)
    {
        // 1. Validación: Si la fecha es pasada (ayer o antes), no hay turnos disponibles.
        if (date.Date < DateTime.Now.Date) return new List<string>();

        // 2. Obtener el doctor y sus horarios configurados de la base de datos.
        var doctor = await _context.Doctors
            .Include(d => d.Schedules) // Importante: Incluir la relación de horarios
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        // Si el doctor no existe, devolvemos lista vacía.
        if (doctor == null) return new List<string>();

        // 3. Determinar qué configuración de horario aplica para el día de la semana solicitado (Lunes, Martes, etc).
        var dayOfWeek = date.DayOfWeek;
        var schedule = doctor.Schedules.FirstOrDefault(s => s.DayOfWeek == dayOfWeek);

        // Si el doctor no trabaja ese día de la semana, devolvemos lista vacía.
        if (schedule == null) return new List<string>();

        // 4. Preparación de variables para el cálculo de intervalos.
        var slots = new List<string>();

        // Convertimos la hora de inicio y fin configurada en el Schedule a objetos DateTime completos para el día solicitado.
        var currentTime = date.Date.Add(schedule.StartTime);
        var endTime = date.Date.Add(schedule.EndTime);

        var now = DateTime.Now;
        var isToday = date.Date == now.Date; // Bandera para saber si estamos consultando el día actual.

        // 5. Obtener los turnos YA ocupados en base de datos para ese doctor y esa fecha.
        // Esto evita ofrecer un turno que ya fue reservado.
        var takenTurns = await _context.Turns
            .Where(t => t.DoctorId == doctorId && t.Date.HasValue && t.Date.Value.Date == date.Date)
            .Select(t => t.Time) // Asumimos que t.Time guarda el string "HH:mm"
            .ToListAsync();

        // 6. Bucle principal: Generar los slots de tiempo.
        // Mientras la hora actual del bucle sea menor a la hora de fin de jornada...
        while (currentTime < endTime)
        {
            var slotTime = currentTime.ToString("HH:mm");

            // Verificamos si este horario específico ya está en la lista de turnos ocupados.
            bool isTaken = takenTurns.Contains(slotTime);

            if (!isTaken)
            {
                // Lógica para el día de hoy:
                // Si NO es hoy, agregamos el turno (porque es una fecha futura).
                // Si ES hoy, solo agregamos el turno si la hora del turno es mayor a la hora actual (no podemos reservar en el pasado).
                if (!isToday || currentTime > now)
                {
                    slots.Add(slotTime);
                }
            }

            // Avanzamos el reloj según la duración configurada del turno (ej: 15, 30, 45 mins).
            currentTime = currentTime.AddMinutes(schedule.DurationMinutes);
        }

        return slots;
    }

    /// <summary>
    /// Método para poblar (Seed) la base de datos con doctores y horarios iniciales si está vacía.
    /// </summary>
    public async Task SeedDoctors()
    {
        // Si ya existen doctores, no hacemos nada para evitar duplicados.
        if (await _context.Doctors.AnyAsync()) return;

        // Lista de doctores históricos (Nota: Excelentes referencias a la medicina argentina)
        var doctors = new List<Doctor>
        {
            // Doctores genéricos / Demo
            new Doctor { Name = "Dr. Alejandro Zurita", Specialty = "Medicina General", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dra. Lopez", Specialty = "Ginecología", Image = "/doc_female_1.png" },
            
            // Especialidad: Cardiología
            new Doctor { Name = "Dr. Ricardo Favaloro", Specialty = "Cardiología", Image = "/doc_male_2.png" },
            new Doctor { Name = "Dra. Cecilia Grierson", Specialty = "Cardiología", Image = "/doc_female_1.png" }, // Primera médica argentina
            new Doctor { Name = "Dr. Esteban Laureano", Specialty = "Cardiología", Image = "/doc_male_1.png" }, // Maradona (Dr. Laureano Maradona)

            // Especialidad: Pediatría
            new Doctor { Name = "Dra. Gabriela Mistral", Specialty = "Pediatría", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. René Favaloro", Specialty = "Pediatría", Image = "/doc_male_2.png" },
            new Doctor { Name = "Dra. Julieta Lanteri", Specialty = "Pediatría", Image = "/doc_female_1.png" },

            // Especialidad: Dermatología
            new Doctor { Name = "Dr. Pedro Mallo", Specialty = "Dermatología", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dra. Alicia Moreau", Specialty = "Dermatología", Image = "/doc_female_1.png" }, // Alicia Moreau de Justo
            new Doctor { Name = "Dr. Salvador Mazza", Specialty = "Dermatología", Image = "/doc_male_2.png" },

            // Especialidad: Traumatología
            new Doctor { Name = "Dr. Ramón Carrillo", Specialty = "Traumatología", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dra. Elvira Rawson", Specialty = "Traumatología", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. Bernardo Houssay", Specialty = "Traumatología", Image = "/doc_male_2.png" }, // Premio Nobel

            // Especialidad: Oftalmología
            new Doctor { Name = "Dra. Petrona Eyle", Specialty = "Oftalmología", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. Luis Agote", Specialty = "Oftalmología", Image = "/doc_male_1.png" }, // Pionero transfusiones
            new Doctor { Name = "Dr. Cosme Argerich", Specialty = "Oftalmología", Image = "/doc_male_2.png" }
        };

        // Guardamos los doctores primero para que se generen sus IDs
        _context.Doctors.AddRange(doctors);
        await _context.SaveChangesAsync();

        // --- Configuración de Horarios (Schedules) ---

        // Función local para buscar el objeto Doctor por nombre (necesitamos su ID generado)
        Doctor GetDoc(string name) => doctors.First(d => d.Name == name);

        var schedules = new List<Schedule>();

        // Asignación de horarios específicos utilizando el método auxiliar AddSchedule

        // Dr. Alejandro Zurita: Lun, Jue, Vie de 10 a 18, turnos de 45m
        AddSchedule(schedules, GetDoc("Dr. Alejandro Zurita"), new[] { DayOfWeek.Monday, DayOfWeek.Thursday, DayOfWeek.Friday }, 10, 18, 45);

        // Dra. Lopez: Lun, Mie, Vie de 9 a 16, turnos de 30m
        AddSchedule(schedules, GetDoc("Dra. Lopez"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 9, 16, 30);

        // ... (resto de las asignaciones para Favaloro, Grierson, etc.)
        AddSchedule(schedules, GetDoc("Dr. Ricardo Favaloro"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 8, 14, 30);
        AddSchedule(schedules, GetDoc("Dra. Cecilia Grierson"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday }, 14, 20, 40);
        AddSchedule(schedules, GetDoc("Dr. Esteban Laureano"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 10, 16, 30);
        AddSchedule(schedules, GetDoc("Dra. Gabriela Mistral"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 9, 15, 20);
        AddSchedule(schedules, GetDoc("Dr. René Favaloro"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 15, 19, 30);
        AddSchedule(schedules, GetDoc("Dra. Julieta Lanteri"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday }, 10, 14, 20);
        AddSchedule(schedules, GetDoc("Dr. Pedro Mallo"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 14, 18, 15);
        AddSchedule(schedules, GetDoc("Dra. Alicia Moreau"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday }, 9, 13, 20);
        AddSchedule(schedules, GetDoc("Dr. Salvador Mazza"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 16, 20, 15);
        AddSchedule(schedules, GetDoc("Dr. Ramón Carrillo"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 8, 12, 30);
        AddSchedule(schedules, GetDoc("Dra. Elvira Rawson"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday }, 14, 19, 30);
        AddSchedule(schedules, GetDoc("Dr. Bernardo Houssay"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 10, 16, 40);
        AddSchedule(schedules, GetDoc("Dra. Petrona Eyle"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 9, 13, 20);
        AddSchedule(schedules, GetDoc("Dr. Luis Agote"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday }, 15, 19, 20);
        AddSchedule(schedules, GetDoc("Dr. Cosme Argerich"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 10, 14, 15);

        // Guardamos todos los horarios en la base de datos
        _context.Schedules.AddRange(schedules);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Método auxiliar privado para simplificar la creación de objetos Schedule y agregarlos a la lista.
    /// </summary>
    private void AddSchedule(List<Schedule> schedules, Doctor doctor, DayOfWeek[] days, int startHour, int endHour, int duration)
    {
        foreach (var day in days)
        {
            schedules.Add(new Schedule
            {
                DoctorId = doctor.Id,
                DayOfWeek = day,
                StartTime = new TimeSpan(startHour, 0, 0), // Hora exacta (ej: 10:00:00)
                EndTime = new TimeSpan(endHour, 0, 0),
                DurationMinutes = duration
            });
        }
    }
}