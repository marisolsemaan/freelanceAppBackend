using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.JobPost;

public class WorkerJobPostResp
{
    public int JobPost_Id { get; set; }

    public string JobPost_Title { get; set; } = string.Empty;

    public string JobPost_Description { get; set; } = string.Empty;

    public decimal JobPost_Price { get; set; }

    public JobPostBudgetType JobPost_BudgetType { get; set; }

    public int JobPost_ProfessionId { get; set; }

    public int JobPost_CityId { get; set; }

    public JobPostStatus JobPost_Status { get; set; }

    public DateTime JobPost_CreatedAt { get; set; }

    public int JobPost_ClientId { get; set; }

    public string User_FullName { get; set; } = string.Empty;

    public decimal User_AvgRating { get; set; }

}