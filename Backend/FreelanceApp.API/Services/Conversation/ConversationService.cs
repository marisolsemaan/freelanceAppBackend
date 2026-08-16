using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Conversation;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Data;

namespace FreelanceApp.API.Services.Conversation;

public class ConversationService : IConversationService
{
    private readonly DbConnectionFactory _dbConnection;

    public ConversationService(DbConnectionFactory dbC)
    {
        _dbConnection = dbC;
    }

    public async Task<ApiResponse<int>> ConnectToJobPostAsync(int workerId, int jobPostId, ConnectJobPostReq request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return new ApiResponse<int>
            {
                Success = false,
                Message = "Message is required."
            };
        }

        using var connection = _dbConnection.CreateConnection();

        connection.Open();

        using var transaction = connection.BeginTransaction();

        try
        {
            // Get job post from the worker pressed on connnect
            const string jobSql = """
                SELECT
                    JobPost_Id,
                    JobPost_ClientId,
                    JobPost_Status
                FROM tbl_JobPost
                WHERE JobPost_Id = @JobPostId;
                """;

            var jobPost =
                await connection.QuerySingleOrDefaultAsync<dynamic>(
                    jobSql,
                    new { JobPostId = jobPostId },
                    transaction);

            if (jobPost == null)
            {
                transaction.Rollback();

                return new ApiResponse<int>
                {
                    Success = false,
                    Message = "Job post not found."
                };
            }

            //  Make sure worker isn't the owner
            if ((int)jobPost.ClientId == workerId)
            {
                transaction.Rollback();

                return new ApiResponse<int>
                {
                    Success = false,
                    Message = "You cannot connect to your own job post."
                };
            }

            // Job must be open
            if ((short)jobPost.Status != (short)JobPostStatus.Open)
            {
                transaction.Rollback();

                return new ApiResponse<int>
                {
                    Success = false,
                    Message = "This job post is closed."
                };
            }

            // Check duplicate connection
            const string duplicateSql = """
                SELECT COUNT(*)
                FROM tbl_Conversation 
                INNER JOIN tbl_JobPostConversation 
                    ON JobPostConversation_ConversationId = Conversation_Id
                WHERE JobPostConversation_JobPostId = @JobPostId
                  AND ClientId = @ClientId
                  AND WorkerId = @WorkerId;
                """;

            var alreadyConnected =
                await connection.ExecuteScalarAsync<int>(
                    duplicateSql,
                    new
                    {
                        JobPostId = jobPostId,
                        ClientId = (int)jobPost.ClientId,
                        WorkerId = workerId
                    },
                    transaction);

            if (alreadyConnected > 0)
            {
                transaction.Rollback();

                return new ApiResponse<int>
                {
                    Success = false,
                    Message = "You have already connected to this job post."
                };
            }

            // Create conversation between the two end-users
            const string conversationSql = """
                INSERT INTO tbl_Conversation
                (
                    Conversation_ClientId,
                    Conversation_WorkerId,
                    Conversation_CreatedAt,
                    Conversation_LastMessageAt
                )
                OUTPUT INSERTED.Id
                VALUES
                (
                    @ClientId,
                    @WorkerId,
                    GETDATE(),
                    GETDATE()
                );
                """;

            var conversationId =
                await connection.ExecuteScalarAsync<int>(
                    conversationSql,
                    new
                    {
                        ClientId = (int)jobPost.ClientId,
                        WorkerId = workerId
                    },
                    transaction);

            // Link conversation to job post
            const string relationSql = """
                INSERT INTO tbl_JobPostConversation
                (
                    JobPostConversation_JobPostId,
                    JobPostConversation_ConversationId,
                    JobPostConversation_ConnectedAt
                )
                VALUES
                (
                    @JobPostId,
                    @ConversationId,
                    GETDATE()
                );
                """;

            await connection.ExecuteAsync(
                relationSql,
                new
                {
                    JobPostId = jobPostId,
                    ConversationId = conversationId
                },
                transaction);

            // First message
            const string messageSql = """
                INSERT INTO tbl_Message
                (
                    Message_ConversationId,
                    Message_SenderId,
                    Message_IsRead,
                    Message_SentAt,
                    Message_Content
                )
                VALUES
                (
                    @ConversationId,
                    @SenderId,
                    0,
                    GETDATE(),
                    @Content
                );
                """;

            await connection.ExecuteAsync(
                messageSql,
                new
                {
                    ConversationId = conversationId,
                    SenderId = workerId,
                    Content = request.Message
                },
                transaction);

            transaction.Commit();

            return new ApiResponse<int>
            {
                Success = true,
                Message = "Connected to job post successfully.",
                Data = conversationId
            };
        }
        catch
        {
            transaction.Rollback();

            return new ApiResponse<int>
            {
                Success = false,
                Message = "Failed to connect to the job post."
            };
        }
    }

    public async Task<ApiResponse<ConversationResp>> GetConversationAsync( int userId, int conversationId)
    {
        using var connection =
            _dbConnection.CreateConnection();

        // Get conversation and the participants
        const string conversationSql = """
            SELECT
                Conversation_Id ,

                Conversation_ClientId,
                client.User_FullName as ClientFullName,
                client.User_AvgRating as ClientAvgRating,

                Conversation_WorkerId,
                worker.User_FullName AS WorkerFullName,
                worker.User_AvgRating AS WorkerAvgRating,

                JobPostConversation_JobPostId,
                JobPost_Title ,

                Conversation_CreatedAt,
                Conversation_LastMessageAt

            FROM tbl_Conversation 

            INNER JOIN tbl_User client
                ON client.User_Id = Conversation_ClientId

            INNER JOIN tbl_User worker
                ON worker.User_Id = Conversation_WorkerId

            LEFT JOIN tbl_JobPostConversation
                ON JobPostConversation_ConversationId = Conversation_Id

            LEFT JOIN tbl_JobPost 
                ON JobPost_JobPost_Id = JobPostConversation_JobPostId

            WHERE Conversation_Id = @ConversationId;
            """;

        var conversation =
            await connection.QuerySingleOrDefaultAsync<ConversationResp>(
                conversationSql,
                new { ConversationId = conversationId });

        if (conversation == null)
        {
            return new ApiResponse<ConversationResp>
            {
                Success = false,
                Message = "Conversation not found."
            };
        }

        // User must belong to conversation
        if (conversation.ClientId != userId && conversation.WorkerId != userId)
        {
            return new ApiResponse<ConversationResp>
            {
                Success = false,
                Message = "You do not have access to this conversation."
            };
        }

        // Normal messages
        const string messagesSql = """
            SELECT
                CAST(1 AS int) AS Message_Type,
                Message_Id,
                Message_SenderId,
                Message_SentAt AS CreatedAt,
                Message_Content,
                Message_IsRead
            FROM tbl_Message
            WHERE ConversationId = @ConversationId;
            """;

        var messages =
            await connection.QueryAsync<ConversationItemResp>(
                messagesSql,
                new { ConversationId = conversationId });

        // Hire offers
        const string offersSql = """
            SELECT
                CAST(2 AS int) AS HireOffer_Type,
                HireOffer_Id,
                Conversation_ClientId AS SenderId,
                HireOffer_OfferedAt AS CreatedAt,

                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price,
                HireOffer_ScopeTerms,
                HireOffer_Status,
                HireOffer_IsRead

            FROM tbl_HireOffer 

            INNER JOIN tbl_Conversation 
                ON Conversation_Id = HireOffer_ConversationId

            WHERE HireOffer_ConversationId = @ConversationId;
            """;

        var offers =
            await connection.QueryAsync<ConversationItemResp>(
                offersSql,
                new { ConversationId = conversationId });

        // Combine both types into one ordered timeline 
        conversation.Items = messages
            .Concat(offers)
            .OrderBy(x => x.CreatedAt)
            .ToList();

        return new ApiResponse<ConversationResp>
        {
            Success = true,
            Message = "Conversation retrieved successfully.",
            Data = conversation
        };
    }

    public async Task<ApiResponse<int>> SendMessageAsync(int userId, int conversationId,SendMessageReq request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return new ApiResponse<int>
            {
                Success = false,
                Message = "Message cannot be empty."
            };
        }

        using var connection = _dbConnection.CreateConnection();

        // Verify user belongs to conversation
        const string accessSql = """
            SELECT COUNT(*)
            FROM tbl_Conversation
            WHERE Id = @ConversationId
            AND (ClientId = @UserId OR WorkerId = @UserId);
            """;

        var hasAccess =
            await connection.ExecuteScalarAsync<int>(
                accessSql,
                new
                {
                    ConversationId = conversationId,
                    UserId = userId
                });

        if (hasAccess == 0)
        {
            return new ApiResponse<int>
            {
                Success = false,
                Message = "You do not have access to this conversation."
            };
        }

        // Insert message
        const string messageSql = """
            INSERT INTO tbl_Message
            (
                Message_ConversationId,
                Message_SenderId,
                Message_IsRead,
                Message_SentAt,
                Message_Content
            )
            OUTPUT INSERTED.Id
            VALUES
            (
                @ConversationId,
                @SenderId,
                0,
                GETDATE(),
                @Content
            );
            """;

        var messageId =
            await connection.ExecuteScalarAsync<int>(
                messageSql,
                new
                {
                    ConversationId = conversationId,
                    SenderId = userId,
                    Content = request.Content.Trim()
                });

        // Update last activity
        const string updateSql = """
            UPDATE tbl_Conversation
            SET LastMessageAt = GETDATE()
            WHERE Id = @ConversationId;
            """;

        await connection.ExecuteAsync(
            updateSql,
            new { ConversationId = conversationId });

        return new ApiResponse<int>
        {
            Success = true,
            Message = "Message sent successfully.",
            Data = messageId
        };
    }

    public async Task<ApiResponse<bool>> MarkConversationAsReadAsync( int userId, int conversationId)
    {
        using var connection = _dbConnection.CreateConnection();

        // Get conversation participants
        const string conversationSql = """
            SELECT
                Conversation_ClientId,
                Conversation_WorkerId
            FROM tbl_Conversation
            WHERE Conversation_Id = @ConversationId;
            """;

        var conversation =
            await connection.QuerySingleOrDefaultAsync<dynamic>(
                conversationSql,
                new { ConversationId = conversationId });

        if (conversation == null)
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "Conversation not found."
            };
        }

        int otherUserId;

        if ((int)conversation.Conversation_ClientId == userId)
        {
            otherUserId = (int)conversation.WorkerId;
        }
        else if ((int)conversation.WorkerId == userId)
        {
            otherUserId = (int)conversation.ClientId;
        }
        else
        {
            return new ApiResponse<bool>
            {
                Success = false,
                Message = "You do not have access to this conversation."
            };
        }

        // Mark messages received from the other user
        const string messageSql = """
            UPDATE tbl_Message
            SET Message_IsRead = 1
            WHERE Message_ConversationId = @ConversationId
            AND Message_SenderId = @OtherUserId
            AND Message_IsRead = 0;
            """;

        await connection.ExecuteAsync(
            messageSql,
            new
            {
                ConversationId = conversationId,
                OtherUserId = otherUserId
            });

        // Hire offers are always sent by the client.
        // Therefore, only a worker needs to mark them as read.
        if ((int)conversation.WorkerId == userId)
        {
            const string offerSql = """
                UPDATE tbl_HireOffer
                SET HireOffer_IsRead = 1
                WHERE HireOffer_ConversationId = @ConversationId
                AND HireOffer_IsRead = 0;
                """;

            await connection.ExecuteAsync(
                offerSql,
                new { ConversationId = conversationId });
        }

        return new ApiResponse<bool>
        {
            Success = true,
            Message = "Conversation marked as read.",
            Data = true
        };
    }

}