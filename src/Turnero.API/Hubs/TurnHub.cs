using Microsoft.AspNetCore.SignalR;

namespace Turnero.API.Hubs;

/// <summary>
/// Hub de SignalR: Actúa como una "Torre de Control" para las comunicaciones en tiempo real.
/// Mantiene conexiones abiertas (WebSockets) con todos los navegadores (Clientes).
/// </summary>
public class TurnHub : Hub
{
    /// <summary>
    /// Este método envía una señal a TODOS los clientes conectados avisando que algo cambió.
    /// </summary>
    public async Task SendTurnUpdate()
    {
        // Clients.All: Selecciona a TODOS los usuarios conectados (Pantalla de TV, Celulares, Recepción).
        // .SendAsync("ReceiveTurnUpdate"): Envía un mensaje invisible llamado "ReceiveTurnUpdate".
        // El Frontend (React/Angular/JS) estará escuchando este evento para refrescar la lista de turnos.
        await Clients.All.SendAsync("ReceiveTurnUpdate");
    }
}