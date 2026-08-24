using FreelanceApp.API.Enums;
using FreelanceApp.API.Services.WorkerJobPost;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceApp.API.Controllers.WorkerJobPost;

[ApiController]
[Route("api/worker/job-posts")]
[Authorize]
public class WorkerJobPostController : ControllerBase
{
    private readonly IWorkerJobPostService _service;

    public WorkerJobPostController(IWorkerJobPostService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobPosts(  [FromQuery] int? cityId,  [FromQuery] int? professionId, [FromQuery] JobPostBudgetType? type,[FromQuery] decimal? maxPrice)
    {
        var result = await _service.GetJobPostsAsync(
            cityId,
            professionId,
            type,
            maxPrice);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}