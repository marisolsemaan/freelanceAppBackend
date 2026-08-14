namespace FreelanceApp.API.DTOs.WorkerProfile;

public class ReviewDto
{
    public int Id { get; set; }
    public int ReviewerId { get; set; }
    public decimal Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}