using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.JobPost;

public class WorkerJobPostResp
{
    public int JobPostId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public JobPostBudgetType Type { get; set; }

    public int ProfessionId { get; set; }

    public int CityId { get; set; }

    public JobPostStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public int ClientId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public decimal ClientAvgRating { get; set; }

}