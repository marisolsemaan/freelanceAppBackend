namespace FreelanceApp.API.DTOs.Conversation;

using System;
using System.Collections.Generic;

public class ConversationResp
{
    public int ConversationId { get; set; }

    public int ClientId { get; set; }

    public string ClientFullName { get; set; } = string.Empty;

    public decimal ClientAvgRating { get; set; }

    public int WorkerId { get; set; }

    public string WorkerFullName { get; set; } = string.Empty;

    public decimal WorkerAvgRating { get; set; }

    // public int? JobPostId { get; set; }

    // public string? JobPostTitle { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? LastMessageAt { get; set; }

    public IEnumerable<ConversationItemResp> Items { get; set; }
        = new List<ConversationItemResp>();
}