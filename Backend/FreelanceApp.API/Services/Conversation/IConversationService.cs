using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Conversation;

namespace FreelanceApp.API.Services.Conversation;

public interface IConversationService
{
    Task<ApiResponse<int>> ConnectToJobPostAsync(int workerId, int jobPostId);

    Task<ApiResponse<ConversationResp>> GetConversationAsync( int userId, int conversationId);

    Task<ApiResponse<int>> SendMessageAsync(int userId, int conversationId, SendMessageReq request);

    Task<ApiResponse<bool>> MarkConversationAsReadAsync(int userId, int conversationId);

    Task<ApiResponse<List<ConversationListItemResp>>> GetUserConversationsAsync(int userId);
}