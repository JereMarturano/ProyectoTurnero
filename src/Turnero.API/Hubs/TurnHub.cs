using Microsoft.AspNetCore.SignalR;

namespace Turnero.API.Hubs;

public class TurnHub : Hub
{
    public async Task SendTurnUpdate()
    {
        await Clients.All.SendAsync("ReceiveTurnUpdate");
    }
}
