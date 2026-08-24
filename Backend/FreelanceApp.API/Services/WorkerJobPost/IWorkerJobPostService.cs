using FreelanceApp.API.DTOs.JobPost;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.Enums;

namespace FreelanceApp.API.Services.WorkerJobPost;

public interface IWorkerJobPostService
{
    Task<ApiResponse<IEnumerable<WorkerJobPostResp>>> GetJobPostsAsync( int? cityId,  int? professionId,  JobPostBudgetType? type, decimal? maxPrice);
}