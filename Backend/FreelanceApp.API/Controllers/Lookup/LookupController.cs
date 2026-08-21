using FreelanceApp.API.Services.Lookup;
using Microsoft.AspNetCore.Mvc;

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
}