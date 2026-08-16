namespace FreelanceApp.API.DTOs.Conversation;

using FreelanceApp.API.Enums;

public class ConversationItemResp
{
    public ConversationItemType Type { get; set; } 

    public int Id { get; set; }

    public int SenderId { get; set; }

    public DateTime CreatedAt { get; set; }

    // Message
    public string? Content { get; set; }
    public bool? IsRead { get; set; }

    // Hire offer
    public int? JobPostId { get; set; }
    public string? Title { get; set; }
    public decimal? Price { get; set; }
    public string? ScopeTerms { get; set; }
    public HireOfferStatus? OfferStatus { get; set; }
}