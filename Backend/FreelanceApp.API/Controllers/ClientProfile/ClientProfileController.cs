using FreelanceApp.API.Services.ClientProfile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceApp.API.Controllers.ClientProfile;

[ApiController]
[Route("api/users")]
[Authorize]
public class ClientProfileController : ControllerBase
{
    private readonly IClientProfileService _service;

    public ClientProfileController(IClientProfileService service)
    {
        _service = service;
    }

    [HttpGet("{userId}/profile")]
    public async Task<IActionResult> GetProfile(int userId)
    {
        var result =  await _service.GetClientProfileAsync(userId);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}