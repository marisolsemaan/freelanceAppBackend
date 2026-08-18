namespace FreelanceApp.API.DTOs.HireOffer;

public class HireOfferReq
{
    // NULL = direct offer
    // Value = offer based on one of the client's existing jobs
    public int? HireOffer_JobPostId { get; set; }

    public string HireOffer_Title { get; set; } = string.Empty;

    public decimal HireOffer_Price { get; set; }

    public string? HireOffer_ScopeTerms { get; set; } 
}