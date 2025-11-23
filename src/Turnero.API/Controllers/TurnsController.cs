using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Turnero.Application;
using Turnero.API.Hubs;

namespace Turnero.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TurnsController : ControllerBase
{
    private readonly TurnService _turnService;
    private readonly IHubContext<TurnHub> _hubContext;

    public TurnsController(TurnService turnService, IHubContext<TurnHub> hubContext)
    {
        _turnService = turnService;
        _hubContext = hubContext;
    }

    [HttpPost("next")]
    public async Task<IActionResult> GetNextTurn()
    {
        var turn = _turnService.GetNextTurn();
        await _hubContext.Clients.All.SendAsync("ReceiveTurnUpdate");
        return Ok(turn);
    }

    [HttpPost("call")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CallTurn()
    {
        var turn = _turnService.CallTurn();
        if (turn == null)
        {
            return NotFound();
        }
        await _hubContext.Clients.All.SendAsync("ReceiveTurnUpdate");
        return Ok(turn);
    }

    [HttpPost("finish")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> FinishTurn()
    {
        var turn = _turnService.FinishTurn();
        if (turn == null)
        {
            return NotFound();
        }
        await _hubContext.Clients.All.SendAsync("ReceiveTurnUpdate");
        return Ok(turn);
    }

    [HttpGet("status")]
    // ... (El resto de tus métodos POST...)

    [HttpGet("status")]
    public IActionResult GetCurrentTurn()
    {
        // 1. Llama al servicio, que devuelve el turno "Llamado" o "null"
        var turn = _turnService.GetCurrentTurn();

        // 2. En lugar de NotFound(), ¡siempre devolvemos OK!
        // Si el turno es null, el frontend recibirá 'null'.
        // Si el turno existe, recibirá el objeto del turno.
        return Ok(turn);
    }
} // Fin de la clase TurnsController


