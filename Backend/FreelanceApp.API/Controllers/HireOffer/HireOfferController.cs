using System.Security.Claims;
using FreelanceApp.API.DTOs.HireOffer;
using FreelanceApp.API.Services.HireOffer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FreelanceApp.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using FreelanceApp.API.Services.Conversation;

namespace FreelanceApp.API.Controllers.HireOffer;

[ApiController]
[Route("api")]
[Authorize]
public class HireOfferController : ControllerBase
{
    private readonly IHireOfferService _service;
    private readonly IHubContext<ConversationHub> _hubContext;
    private readonly IConversationService _conversationService;

    public HireOfferController(IHireOfferService service, IHubContext<ConversationHub> hubContext, IConversationService cs)
    {
        _service = service;
        _hubContext= hubContext;
        _conversationService = cs;
    }

    // Client click on hire offer button in conversation with worker
    [HttpPost("conversations/{conversationId}/hire-offer")]
    public async Task<IActionResult> CreateHireOffer(int conversationId, [FromBody] HireOfferReq request)
    {
        var clientId = GetUserId();

        var result = await _service.CreateHireOfferAsync(clientId, conversationId, request);

        if (!result.Success)
            return BadRequest(result);

        //get the users of this converstaion
        var conversationResult = await _conversationService.GetConversationAsync(clientId, conversationId );

        if(conversationResult.Success)
        {
            var conversation= conversationResult.Data!;

            await _hubContext.Clients.Users(conversation.ClientId.ToString(), conversation.WorkerId.ToString())
                .SendAsync("ConversationUpdated",conversationId);
        }

        return Ok(result);
    }

    // Worker can accept or reject a hire offer
    [HttpPatch("worker/hire-offers/{hireOfferId}/status")]
    public async Task<IActionResult> UpdateStatus(int hireOfferId, [FromBody] UpdateHireOfferStatusReq request)
    {
        var workerId = GetUserId();

        var result =
            await _service.UpdateOfferStatusAsync(
                workerId,
                hireOfferId,
                request);

        if (!result.Success)
            return BadRequest(result);

        var conversationResult= await _conversationService.GetConversationAsync(workerId, 
            result.Data!.HireOffer_ConversationId);

        if(conversationResult.Success)
        {
            var conversation= conversationResult.Data!;

            await _hubContext.Clients.Users(conversation.ClientId.ToString(), conversation.WorkerId.ToString())
                .SendAsync("ConversationUpdated",result.Data.HireOffer_ConversationId);
        }

        return Ok(result);
    }

    [HttpPatch("client/hire-offers/{hireOfferId}/complete")] // client close hire offer after worker's work completion
    public async Task<IActionResult> CompleteHireOffer(int hireOfferId)
    {
        var clientId = GetUserId();

        var result =
            await _service.CompleteHireOfferAsync(
                clientId,
                hireOfferId);

        if (!result.Success)
            return BadRequest(result);

        var conversationResult =
            await _conversationService.GetConversationAsync(
                clientId,
                result.Data!.HireOffer_ConversationId);

        if (conversationResult.Success)
        {
            var conversation = conversationResult.Data!;

            await _hubContext.Clients
                .Users(
                    conversation.ClientId.ToString(),
                    conversation.WorkerId.ToString())
                .SendAsync(
                    "ConversationUpdated",
                    result.Data.HireOffer_ConversationId);
        }

        return Ok(result);
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
}