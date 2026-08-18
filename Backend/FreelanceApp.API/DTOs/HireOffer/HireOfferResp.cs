using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.HireOffer;

public class HireOfferResp
{
    public int HireOffer_Id { get; set; }

    public int HireOffer_ConversationId { get; set; }

    public int HireOffer_WorkerId { get; set; }

    public int? HireOffer_JobPostId { get; set; }

    public string HireOffer_Title { get; set; } = string.Empty;

    public decimal HireOffer_Price { get; set; }

    public string? HireOffer_ScopeTerms { get; set; }

    public HireOfferStatus HireOffer_Status { get; set; }

    public DateTime HireOffer_OfferedAt { get; set; }
}