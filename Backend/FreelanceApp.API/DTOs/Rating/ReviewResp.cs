namespace FreelanceApp.API.DTOs.Rating;

public class ReviewResp
{
    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}