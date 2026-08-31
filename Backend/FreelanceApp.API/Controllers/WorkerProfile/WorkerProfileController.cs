using System.Security.Claims;
using FreelanceApp.API.DTOs.WorkerProfile;
using FreelanceApp.API.Services.WorkerProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace FreelanceApp.API.Controllers;

[ApiController]
[Route("api/worker")]
public class WorkerProfileController : ControllerBase
{
    private readonly IWorkerProfileService _workerProfileService;

    public WorkerProfileController(IWorkerProfileService workerProfileService)
    {
        _workerProfileService = workerProfileService;
    }


    // GET: api/worker/{workerId}/profile
    [HttpGet("{workerId}/profile")]
    public async Task<IActionResult> GetWorkerProfile(int workerId)
    {
         var result =
            await _workerProfileService.GetWorkerProfileAsync(workerId);
    
         if (result.profile is null)
        {
            return NotFound(new
            {
                message = result.message
            });
        }

    
        return Ok(result.profile);
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetWorkerProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var workerId))
        {
            return Unauthorized(new
            {
                message = "Invalid user authentication."
            });
        }
        
        var result = await _workerProfileService.GetWorkerProfileAsync(workerId);

        if (result.profile is null)
        {
            return NotFound(new
            {
                message = result.message
            });
        }

        return Ok(result.profile);
    }


    // PUT: api/worker/profile
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateWorkerProfile(  [FromBody] UpdateWorkerProfileReq request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity"
            });
        }

        var result = await _workerProfileService
            .UpdateWorkerProfileAsync(userId, request);

        if (result.profile is null)
        {
            return BadRequest(new
            {
                message = result.message
            });
        }

        return Ok(new
        {
            message = result.message,
            profile = result.profile
        });
    }


}