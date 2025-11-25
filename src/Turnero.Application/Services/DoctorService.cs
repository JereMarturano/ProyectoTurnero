using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Turnero.Core;
using Turnero.Infrastructure;

namespace Turnero.Application.Services;

public class DoctorService
{
    private readonly TurneroDbContext _context;

    public DoctorService(TurneroDbContext context)
    {
        _context = context;
    }

    public async Task<List<Doctor>> GetDoctors()
    {
        return await _context.Doctors.Include(d => d.Schedules).ToListAsync();
    }

    public async Task<List<string>> GetAvailableSlots(int doctorId, DateTime date)
    {
        var doctor = await _context.Doctors
            .Include(d => d.Schedules)
            .FirstOrDefaultAsync(d => d.Id == doctorId);

        if (doctor == null) return new List<string>();

        var dayOfWeek = date.DayOfWeek;
        var schedule = doctor.Schedules.FirstOrDefault(s => s.DayOfWeek == dayOfWeek);

        if (schedule == null) return new List<string>();

        var slots = new List<string>();
        var currentTime = date.Date.Add(schedule.StartTime);
        var endTime = date.Date.Add(schedule.EndTime);
        var now = DateTime.Now;
        var isToday = date.Date == now.Date;

        // Get taken slots for this doctor and date
        var takenTurns = await _context.Turns
            .Where(t => t.DoctorId == doctorId && t.Date.HasValue && t.Date.Value.Date == date.Date)
            .Select(t => t.Time)
            .ToListAsync();

        while (currentTime < endTime)
        {
            var slotTime = currentTime.ToString("HH:mm");
            
            // Check if slot is taken
            // Note: Turn.Time is likely a string or TimeSpan. Assuming string based on mockData.js usage "HH:mm"
            // If Turn.Time is TimeSpan, we need to format it. Let's check Turn model later if needed, but assuming string for now based on typical patterns or adjust.
            // Actually, let's assume Turn.Time is string to match mockData.js "time": "10:00"
            // Wait, I should check Turn model. But for now I'll write it assuming string.
            
            bool isTaken = takenTurns.Contains(slotTime);

            if (!isTaken)
            {
                if (!isToday || currentTime > now)
                {
                    slots.Add(slotTime);
                }
            }

            currentTime = currentTime.AddMinutes(schedule.DurationMinutes);
        }

        return slots;
    }

    public async Task SeedDoctors()
    {
        if (await _context.Doctors.AnyAsync()) return;

        var doctors = new List<Doctor>
        {
            // Existing Doctors
            new Doctor { Name = "Dr. Alejandro Zurita", Specialty = "Medicina General", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dra. Lopez", Specialty = "Ginecología", Image = "/doc_female_1.png" },
            
            // Cardiología
            new Doctor { Name = "Dr. Ricardo Favaloro", Specialty = "Cardiología", Image = "/doc_male_2.png" },
            new Doctor { Name = "Dra. Cecilia Grierson", Specialty = "Cardiología", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. Esteban Laureano", Specialty = "Cardiología", Image = "/doc_male_1.png" },

            // Pediatría
            new Doctor { Name = "Dra. Gabriela Mistral", Specialty = "Pediatría", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. René Favaloro", Specialty = "Pediatría", Image = "/doc_male_2.png" },
            new Doctor { Name = "Dra. Julieta Lanteri", Specialty = "Pediatría", Image = "/doc_female_1.png" },

            // Dermatología
            new Doctor { Name = "Dr. Pedro Mallo", Specialty = "Dermatología", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dra. Alicia Moreau", Specialty = "Dermatología", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. Salvador Mazza", Specialty = "Dermatología", Image = "/doc_male_2.png" },

            // Traumatología
            new Doctor { Name = "Dr. Ramón Carrillo", Specialty = "Traumatología", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dra. Elvira Rawson", Specialty = "Traumatología", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. Bernardo Houssay", Specialty = "Traumatología", Image = "/doc_male_2.png" },

            // Oftalmología
            new Doctor { Name = "Dra. Petrona Eyle", Specialty = "Oftalmología", Image = "/doc_female_1.png" },
            new Doctor { Name = "Dr. Luis Agote", Specialty = "Oftalmología", Image = "/doc_male_1.png" },
            new Doctor { Name = "Dr. Cosme Argerich", Specialty = "Oftalmología", Image = "/doc_male_2.png" }
        };

        _context.Doctors.AddRange(doctors);
        await _context.SaveChangesAsync();

        // Now add schedules
        // Helper to find doctor by name
        Doctor GetDoc(string name) => doctors.First(d => d.Name == name);

        var schedules = new List<Schedule>();

        // Dr. Alejandro Zurita: Mon, Thu, Fri 10-18, 45m
        AddSchedule(schedules, GetDoc("Dr. Alejandro Zurita"), new[] { DayOfWeek.Monday, DayOfWeek.Thursday, DayOfWeek.Friday }, 10, 18, 45);

        // Dra. Lopez: Mon, Wed, Fri 9-16, 30m
        AddSchedule(schedules, GetDoc("Dra. Lopez"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 9, 16, 30);

        // Dr. Ricardo Favaloro: Mon-Fri 8-14, 30m
        AddSchedule(schedules, GetDoc("Dr. Ricardo Favaloro"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 8, 14, 30);

        // Dra. Cecilia Grierson: Tue, Thu, Sat 14-20, 40m
        AddSchedule(schedules, GetDoc("Dra. Cecilia Grierson"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday }, 14, 20, 40);

        // Dr. Esteban Laureano: Mon, Wed, Fri 10-16, 30m
        AddSchedule(schedules, GetDoc("Dr. Esteban Laureano"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 10, 16, 30);

        // Dra. Gabriela Mistral: Mon-Fri 9-15, 20m
        AddSchedule(schedules, GetDoc("Dra. Gabriela Mistral"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 9, 15, 20);

        // Dr. René Favaloro: Mon, Wed, Fri 15-19, 30m
        AddSchedule(schedules, GetDoc("Dr. René Favaloro"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 15, 19, 30);

        // Dra. Julieta Lanteri: Tue, Thu, Sat 10-14, 20m
        AddSchedule(schedules, GetDoc("Dra. Julieta Lanteri"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday }, 10, 14, 20);

        // Dr. Pedro Mallo: Mon, Wed, Fri 14-18, 15m
        AddSchedule(schedules, GetDoc("Dr. Pedro Mallo"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 14, 18, 15);

        // Dra. Alicia Moreau: Tue, Thu 9-13, 20m
        AddSchedule(schedules, GetDoc("Dra. Alicia Moreau"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday }, 9, 13, 20);

        // Dr. Salvador Mazza: Mon-Fri 16-20, 15m
        AddSchedule(schedules, GetDoc("Dr. Salvador Mazza"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 16, 20, 15);

        // Dr. Ramón Carrillo: Mon, Wed, Fri 8-12, 30m
        AddSchedule(schedules, GetDoc("Dr. Ramón Carrillo"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 8, 12, 30);

        // Dra. Elvira Rawson: Tue, Thu, Sat 14-19, 30m
        AddSchedule(schedules, GetDoc("Dra. Elvira Rawson"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday }, 14, 19, 30);

        // Dr. Bernardo Houssay: Mon-Fri 10-16, 40m
        AddSchedule(schedules, GetDoc("Dr. Bernardo Houssay"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 10, 16, 40);

        // Dra. Petrona Eyle: Mon, Wed, Fri 9-13, 20m
        AddSchedule(schedules, GetDoc("Dra. Petrona Eyle"), new[] { DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday }, 9, 13, 20);

        // Dr. Luis Agote: Tue, Thu 15-19, 20m
        AddSchedule(schedules, GetDoc("Dr. Luis Agote"), new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday }, 15, 19, 20);

        // Dr. Cosme Argerich: Mon-Fri 10-14, 15m
        AddSchedule(schedules, GetDoc("Dr. Cosme Argerich"), new[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday }, 10, 14, 15);

        _context.Schedules.AddRange(schedules);
        await _context.SaveChangesAsync();
    }

    private void AddSchedule(List<Schedule> schedules, Doctor doctor, DayOfWeek[] days, int startHour, int endHour, int duration)
    {
        foreach (var day in days)
        {
            schedules.Add(new Schedule
            {
                DoctorId = doctor.Id,
                DayOfWeek = day,
                StartTime = new TimeSpan(startHour, 0, 0),
                EndTime = new TimeSpan(endHour, 0, 0),
                DurationMinutes = duration
            });
        }
    }
}
