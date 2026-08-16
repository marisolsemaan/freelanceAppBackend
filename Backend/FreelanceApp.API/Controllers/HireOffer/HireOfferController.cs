using System.Security.Claims;
using FreelanceApp.API.DTOs.HireOffer;
using FreelanceApp.API.Services.HireOffer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceApp.API.Controllers.HireOffer;

[ApiController]
[Route("api")]
[Authorize]
public class HireOfferController : ControllerBase
{
    private readonly IHireOfferService _service;

    public HireOfferController(IHireOfferService service)
    {
        _service = service;
    }

    // Client click on hire offer button in conversation with worker
    [HttpPost("conversations/{conversationId}/hire-offer")]
    public async Task<IActionResult> CreateHireOffer(int conversationId, [FromBody] HireOfferReq request)
    {
        var clientId = GetUserId();

        var result =
            await _service.CreateHireOfferAsync(
                clientId,
                conversationId,
                request);

        if (!result.Success)
            return BadRequest(result);

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