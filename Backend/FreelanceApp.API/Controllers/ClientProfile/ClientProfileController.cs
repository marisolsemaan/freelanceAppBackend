using System.Security.Claims;
using FreelanceApp.API.Services.ClientProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceApp.API.Controllers.ClientProfile;

[ApiController]
[Route("api/users")]
public class ClientProfileController : ControllerBase
{
    private readonly IClientProfileService _service;

    public ClientProfileController(IClientProfileService service)
    {
        _service = service;
    }

    [HttpGet("{clientId}/profile")]
    public async Task<IActionResult> GetClientProfile(int clientId)
    {
        var result = await _service.GetClientProfileAsync(clientId);
    
        if (!result.Success)
            return NotFound(result);
    
        return Ok(result);
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
          var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var clientId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user authentication."
                });
            }
        
        var result =  await _service.GetClientProfileAsync(clientId);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}