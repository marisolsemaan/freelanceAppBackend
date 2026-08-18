namespace FreelanceApp.API.DTOs.Rating;

public class CreateReviewReq
{
    public int Review_HireOfferId { get; set; }

    public decimal Review_Rating { get; set; }

    public string? Review_Comment { get; set; }
}