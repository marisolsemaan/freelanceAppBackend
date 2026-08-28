using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FreelanceApp.API.Hubs;

[Authorize]
public class ConversationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId =
            Context.User?
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value;

        Console.WriteLine(
            $"SignalR connected. UserId: {userId}, ConnectionId: {Context.ConnectionId}"
        );

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(
        Exception? exception
    )
    {
        Console.WriteLine(
            $"SignalR disconnected. ConnectionId: {Context.ConnectionId}"
        );

        await base.OnDisconnectedAsync(exception);
    }
}