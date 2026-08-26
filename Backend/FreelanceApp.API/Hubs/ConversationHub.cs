using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FreelanceApp.API.Hubs;

[Authorize]
public class ConversationHub : Hub
{ // empty cause enpoint handle sending reading messages , this is an open connection to get live messages when either users sends
}