namespace FreelanceApp.API.DTOs.Conversation;

public class ConversationMessageResp
{
    public int MessageId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}