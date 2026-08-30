using FreelanceApp.API.Services.Lookup;
using Microsoft.AspNetCore.Mvc;
using FreelanceApp.API.Data;
using Microsoft.AspNetCore.Authorization;
using FreelanceApp.API.DTOs.WorkerProfile;
using System.Security.Claims;
using FreelanceApp.API.Helpers;

namespace FreelanceApp.API.Controllers;

[ApiController]
[Route("api/lookups")]
public class LookupController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet("professions")]
    public async Task<IActionResult> GetProfessions()
    {
        var result = await _lookupService.GetProfessionsAsync();

        if (result.Message != "Professions retrieved successfully.")
        {
            return BadRequest();
        }

        return Ok(result);
    }

    [HttpGet("cities")]
    public async Task<IActionResult> GetCities()
    {
        var result = await _lookupService.GetCitiesAsync();

          if (result.Message != "Cities retrieved successfully.")
        {
            return BadRequest();
        }

        return Ok(result);
    }

    [HttpPost("professions")]
    [Authorize]
    public async Task<IActionResult> CreateProfession( [FromBody] CreateProfessionReq request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var workerId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "User ID not found."
            });
        }

        var result = await _lookupService.CreateProfessionAsync( request, workerId);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(new
        {
            id = result.Data!.Profession_Id,
            title = result.Data.Profession_Title
        });
    }
}