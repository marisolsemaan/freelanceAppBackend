using FreelanceApp.API.DTOs;

using FreelanceApp.API.DTOs.JobPost;

namespace FreelanceApp.API.Services.ClientJobPost;

public interface IClientJobPostService
{
    Task<ApiResponse<ClientJobPostResp>> CreateOrUpdateJobPostAsync( int clientId, CreateUpdateJobPostReq request);

    Task<ApiResponse<object>> GetMyJobPostsAsync( int clientId);

    Task<ApiResponse<object>> CloseJobPostAsync( int clientId, int jobPostId);

    Task<ApiResponse<IEnumerable<JobPostTitleResp>>> GetJobPostTitlesAsync(int clientId);
}