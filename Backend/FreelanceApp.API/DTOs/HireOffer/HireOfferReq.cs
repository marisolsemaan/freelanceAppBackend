namespace FreelanceApp.API.DTOs.HireOffer;

public class HireOfferReq
{
    // NULL = direct offer
    // Value = offer based on one of the client's existing jobs
    public int? JobPostId { get; set; }

    public string Title { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string ScopeTerms { get; set; } = string.Empty;
}