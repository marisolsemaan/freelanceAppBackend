namespace FreelanceApp.API.DTOs.WorkerProfile;

public class ReviewDto
{
    public int Review_Id { get; set; }
    public int Review_ReviewerId { get; set; }
    public decimal Review_Rating { get; set; }
    public string? Review_Comment { get; set; }
    public DateTime Review_CreatedAt { get; set; }
}