namespace FreelanceApp.API.DTOs.Conversation;

public class ConversationJobPostResp
{
    public int JobPostId { get; set; }
    public string JobPostTitle { get; set; } = null!;
    public string? JobPostProfession { get; set; }
    public decimal JobPostPrice { get; set; }
    public string? JobPostCity { get; set; }
    public bool IsClosed { get; set; } // active=0 and close=1 
    public DateTime CreatedAt { get; set; }
}