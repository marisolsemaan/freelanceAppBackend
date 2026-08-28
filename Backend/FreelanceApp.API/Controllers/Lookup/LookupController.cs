using FreelanceApp.API.Services.Lookup;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceApp.API.Controllers;

[ApiController]
[Route("api/lookups")]
public class LookupController : ControllerBase
{
    private readonly ILookupService _lookupService;

    private readonly DbConnectionFactory _connection;

    public LookupController(ILookupService lookupService, DBConnection c)
    {
        _lookupService = lookupService;
        _connection=c;
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
    public async Task<IActionResult> CreateProfession(
        [FromBody] CreateProfessionReq request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new
            {
                message = "Profession title is required."
            });
        }

        var title = request.Title.Trim();

        const string existingSql = """
            SELECT 
                Profession_Id,
                Profession_Title
            FROM tbl_Profession
            WHERE LOWER(LTRIM(RTRIM(Profession_Title))) = LOWER(@Title);
            """;

        var existing = await _connection.QuerySingleOrDefaultAsync<ProfessionDto>(
            existingSql,
            new { Title = title });

        if (existing != null)
        {
            return Ok(new
            {
                id = existing.Profession_Id,
                title = existing.Profession_Title
            });
        }

        const string insertSql = """
            INSERT INTO tbl_Profession (Profession_Title)
            OUTPUT INSERTED.Profession_Id
            VALUES (@Title);
            """;

        var professionId = await _connection.ExecuteScalarAsync<int>(
            insertSql,
            new { Title = title });

        return Ok(new
        {
            id = professionId,
            title = title
        });
    }
}