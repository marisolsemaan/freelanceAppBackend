using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.JobPost;

public class CreateUpdateJobPostReq
{
    public int? JobPostId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public JobPostBudgetType Type { get; set; }

    public int ProfessionId { get; set; }

    public int CityId { get; set; }
}