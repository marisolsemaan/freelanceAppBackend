namespace FreelanceApp.API.DTOs.Rating;

public class ReviewResp
{
    public int Id { get; set; }

    public int ReviewerId { get; set; }

    public decimal Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }
}