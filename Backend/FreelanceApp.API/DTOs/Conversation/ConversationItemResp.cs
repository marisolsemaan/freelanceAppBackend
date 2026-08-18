namespace FreelanceApp.API.DTOs.Conversation;

using FreelanceApp.API.Enums;

public class ConversationItemResp
{
    public ConversationItemType Type { get; set; }
    public DateTime CreatedAt { get; set; }

    // Normal message
    public int? MessageId { get; set; }
    public int? SenderId { get; set; }
    public string? Content { get; set; }
    public bool? IsRead { get; set; }

    // Job post
    public int? JobPostId { get; set; }
    public string? JobPostTitle { get; set; }
    public string? JobPostProfession { get; set; }
    public decimal? JobPostPrice { get; set; }
    public string? JobPostCity { get; set; }

    // Hire offer
    public int? HireOfferId { get; set; }
    public string? OfferTitle { get; set; }
    public decimal? OfferPrice { get; set; }
    public string? ScopeTerms { get; set; }
    public short? OfferStatus { get; set; }
}

// public class ConversationItemResp
// {
//     public ConversationItemType Type { get; set; } 

//     public int Id { get; set; }

//     public int SenderId { get; set; }

//     public DateTime CreatedAt { get; set; }

//     // Message
//     public string? Content { get; set; }
//     public bool? IsRead { get; set; }

//     // Hire offer
//     public int? JobPostId { get; set; }
//     public string? Title { get; set; }
//     public decimal? Price { get; set; }
//     public string? ScopeTerms { get; set; }
//     public HireOfferStatus? OfferStatus { get; set; }
// }