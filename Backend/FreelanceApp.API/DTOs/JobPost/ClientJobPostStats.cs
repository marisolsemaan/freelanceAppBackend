namespace FreelanceApp.API.DTOs.JobPost;

public class JobPostStatsResp
{
    public int TotalJobs { get; set; }

    public int OpenJobs { get; set; } // status="open"

    public int ClosedJobs { get; set; }// status="closed"

    public int TotalConversations { get; set; }// how many open conversations this client has across all job posts
}