using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Rating;

namespace FreelanceApp.API.Services.Rating;

public interface IRatingService
{
    Task<ApiResponse<ReviewResp>> CreateReviewAsync(int reviewerId, CreateReviewReq request);
}