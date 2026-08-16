namespace FreelanceApp.API.DTOs.Rating;

public class CreateReviewReq
{
    public int HireOfferId { get; set; }

    public decimal Rating { get; set; }

    public string? Comment { get; set; }
}