using FreelanceApp.API.DTOs;

using FreelanceApp.API.DTOs.JobPost;

namespace FreelanceApp.API.Services.ClientJobPost;

public interface IClientJobPostService
{
    Task<ApiResponse<ClientJobPostResp>> CreateJobPostAsync( int clientId, CreateJobPostReq request);

    Task<ApiResponse<object>> GetMyJobPostsAsync( int clientId);

    Task<ApiResponse<object>> CloseJobPostAsync( int clientId, int jobPostId);

    Task<ApiResponse<IEnumerable<JobPostTitleResp>>> GetJobPostTitlesAsync(int clientId);
}