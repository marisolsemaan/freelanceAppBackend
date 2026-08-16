
using FreelanceApp.API.Services.Rating;
using FreelanceApp.API.DTOs.Rating;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/ratings")]
public class RatingController : ControllerBase
{
    private readonly IRatingService _ratingService;

    public RatingController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewReq request)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result = await _ratingService.CreateReviewAsync(
            userId,
            request);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}