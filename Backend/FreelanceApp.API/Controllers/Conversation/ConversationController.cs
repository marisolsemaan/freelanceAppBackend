using System.Security.Claims;
using FreelanceApp.API.DTOs.Conversation;
using FreelanceApp.API.Services.Conversation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FreelanceApp.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace FreelanceApp.API.Controllers.Conversation;

[ApiController]
[Route("api/conversations")]
[Authorize]
public class ConversationController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly IHubContext<ConversationHub> _hubContext;

    public ConversationController(IConversationService conversationService, IHubContext<ConversationHub>  hubContext)
    {
        _conversationService = conversationService;
        _hubContext= hubContext;
    }

    // Worker clicks on connect in a job post
    [HttpPost("/api/worker/job-posts/{jobPostId}/connect")]
    public async Task<IActionResult> ConnectToJobPost(int jobPostId)
    {
        var workerId = GetUserId();

        var result =
            await _conversationService.ConnectToJobPostAsync(
                workerId,
                jobPostId
            );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        var conversationResult =
            await _conversationService.GetConversationAsync(
                workerId,
                result.Data
            );

        if (conversationResult.Success)
        {
            var conversation = conversationResult.Data!;

            await NotifyConversationUpdated(
                result.Data,
                conversation.ClientId,
                conversation.WorkerId
            );
        }

        return Ok(result);
    }

    // Get conversation and ordered timeline of messages
    [HttpGet("{conversationId}")]public async Task<IActionResult> GetConversation( int conversationId)
    {
        var userId = GetUserId();

        var result =
            await _conversationService.GetConversationAsync(
                userId,
                conversationId);

        return result.Success
            ? Ok(result)
            : BadRequest(result);
    }

    // Send normal message
    [HttpPost("{conversationId}/messages")]
    public async Task<IActionResult> SendMessage(int conversationId, [FromBody] SendMessageReq request)
    {
        var userId = GetUserId();

        var result =
            await _conversationService.SendMessageAsync(
                userId,
                conversationId,
                request
            );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        var conversationResult =
            await _conversationService.GetConversationAsync(
                userId,
                conversationId
            );

        if (conversationResult.Success)
        {
            var conversation = conversationResult.Data!;

            await NotifyConversationUpdated(
                conversationId,
                conversation.ClientId,
                conversation.WorkerId
            );
        }

        return Ok(result);
    }

    // Mark received items as read
    [HttpPatch("{conversationId}/read")]
    public async Task<IActionResult> MarkAsRead( int conversationId)
    {
        var userId = GetUserId();

        var result =
            await _conversationService.MarkConversationAsReadAsync(
                userId,
                conversationId);

        return result.Success
            ? Ok(result)
            : BadRequest(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserConversations()
    {
        var userId = GetUserId();

        var result = await _conversationService.GetUserConversationsAsync(userId);

        return result.Success
            ? Ok(result)
            : BadRequest(result);
    }

    private int GetUserId()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(claim))
            throw new UnauthorizedAccessException(
                "User ID was not found in the token.");

        return int.Parse(claim);
    }

    private async Task NotifyConversationUpdated(int conversationId, int clientId, int workerId){
        await _hubContext.Clients.Users(clientId.ToString(), workerId.ToString()).SendAsync("ConversationUpdated", conversationId);
    }
}