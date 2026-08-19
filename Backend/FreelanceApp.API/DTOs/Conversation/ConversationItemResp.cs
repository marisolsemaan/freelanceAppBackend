namespace FreelanceApp.API.DTOs.Conversation;

public class ConversationItemResp
{
    public string Type { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ConversationMessageResp? Message { get; set; }
    public ConversationJobPostResp? JobPost { get; set; }
    public ConversationHireOfferResp? HireOffer { get; set; }
}