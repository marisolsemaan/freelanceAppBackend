using System.Security.Claims;
using FreelanceApp.API.DTOs.JobPost;
using FreelanceApp.API.Services.ClientJobPost;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FreelanceApp.API.Enums;

namespace FreelanceApp.API.Controllers.ClientJobPost;

[ApiController]
[Route("api/client/job-posts")]
[Authorize]
public class ClientJobPostController : ControllerBase
{
    private readonly IClientJobPostService _service;

    public ClientJobPostController(IClientJobPostService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobPostReq request)
    {
        var clientId = GetUserId();

        var result = await _service.CreateJobPostAsync(clientId, request);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyJobPosts()
    {
        var clientId = GetUserId();

        var result = await _service.GetMyJobPostsAsync(clientId);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPatch("{jobPostId}/close")]
    public async Task<IActionResult> CloseJobPost( int jobPostId)
    {
        var clientId = GetUserId();

        var result = await _service.CloseJobPostAsync(clientId, jobPostId);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("client/job-posts/titles")] // get titles of job posts as dropdown so client can choose from for hire offers
    public async Task<IActionResult> GetJobPostTitles()
    {
        var clientId = GetUserId();

        var result =
            await _service.GetJobPostTitlesAsync(clientId);

        return Ok(result);
    }

    private int GetUserId() // get client id from the jwt token
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(claim))
            throw new UnauthorizedAccessException(
                "User ID was not found in the token.");

        return int.Parse(claim);
    }
}