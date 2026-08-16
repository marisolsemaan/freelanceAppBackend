using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.HireOffer;

public class HireOfferResp
{
    public int HireOfferId { get; set; }

    public int ConversationId { get; set; }

    public int? JobPostId { get; set; }

    public string Title { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string ScopeTerms { get; set; } = string.Empty;

    public HireOfferStatus Status { get; set; }

    public DateTime OfferedAt { get; set; }
}