using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.Conversation;

public class ConversationHireOfferResp
{
    public int HireOfferId { get; set; }
    public int SenderId { get; set; }
    public int? JobPostId { get; set; }
    public string OfferTitle { get; set; } = null!;
    public decimal OfferPrice { get; set; }
    public string? ScopeTerms { get; set; } = null!;
    public HireOfferStatus OfferStatus { get; set; }
    public bool IsRead { get; set; }
    public bool HasCurrentUserReviewed { get; set; }
    public DateTime CreatedAt { get; set; }
}