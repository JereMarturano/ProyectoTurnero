using Microsoft.AspNetCore.Mvc;
using Turnero.Application.Services;
using Turnero.Core;

namespace Turnero.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly DoctorService _doctorService;

    public DoctorsController(DoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Doctor>>> GetDoctors()
    {
        return await _doctorService.GetDoctors();
    }

    [HttpGet("{doctorId}/slots")]
    public async Task<ActionResult<List<string>>> GetAvailableSlots(int doctorId, [FromQuery] DateTime date)
    {
        return await _doctorService.GetAvailableSlots(doctorId, date);
    }
}
