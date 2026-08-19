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

    public async Task<ApiResponse<int>> ConnectToJobPostAsync(int workerId, int jobPostId)
    {
        using var connection = _dbConnection.CreateConnection();

        connection.Open();

        using var transaction = connection.BeginTransaction();

        try
        {
            // Get an OPEN job post
            const string jobSql = """
                SELECT
                    JobPost_Id AS JobPostId,
                    JobPost_ClientId AS ClientId
                FROM tbl_JobPost
                WHERE JobPost_Id = @JobPostId
                AND JobPost_Status = @OpenStatus;
                """;

            var jobPost =
                await connection.QuerySingleOrDefaultAsync<dynamic>(
                    jobSql,
                    new
                    {
                        JobPostId = jobPostId,
                        OpenStatus = (short)JobPostStatus.Open
                    },
                    transaction);

            if (jobPost == null)
            {
                transaction.Rollback();

                return new ApiResponse<int>
                {
                    Success = false,
                    Message = "Job post not found or is no longer available."
                };
            }

            // Worker cannot connect to own job
            if ((int)jobPost.ClientId == workerId)
            {
                transaction.Rollback();

                return new ApiResponse<int>
                {
                    Success = false,
                    Message = "You cannot connect to your own job post."
                };
            }

            //  Find existing conversation between worker and client
            const string conversationCheckSql = """
                SELECT Conversation_Id
                FROM tbl_Conversation
                WHERE Conversation_ClientId = @ClientId
                AND Conversation_WorkerId = @WorkerId;
                """;

            var conversationId =
                await connection.ExecuteScalarAsync<int?>(
                    conversationCheckSql,
                    new
                    {
                        ClientId = (int)jobPost.ClientId,
                        WorkerId = workerId
                    },
                    transaction);

            //  Create conversation if it doesn't exist
            if (conversationId == null)
            {
                const string conversationSql = """
                    INSERT INTO tbl_Conversation
                    (
                        Conversation_ClientId,
                        Conversation_WorkerId,
                        Conversation_CreatedAt,
                        Conversation_LastMessageAt
                    )
                    OUTPUT INSERTED.Conversation_Id
                    VALUES
                    (
                        @ClientId,
                        @WorkerId,
                        GETDATE(),
                        GETDATE()
                    );
                    """;

                conversationId =
                    await connection.ExecuteScalarAsync<int>(
                        conversationSql,
                        new
                        {
                            ClientId = (int)jobPost.ClientId,
                            WorkerId = workerId
                        },
                        transaction);
            }

            //  Check whether this job is already attached
            const string jobConversationCheckSql = """
                SELECT COUNT(*)
                FROM tbl_JobPostConversation
                WHERE JobPostConversation_JobPostId = @JobPostId
                AND JobPostConversation_ConversationId = @ConversationId;
                """;

            var alreadyLinked =
                await connection.ExecuteScalarAsync<int>(
                    jobConversationCheckSql,
                    new
                    {
                        JobPostId = jobPostId,
                        ConversationId = conversationId.Value
                    },
                    transaction);

            //  Attach job to conversation
            if (alreadyLinked == 0)
            {
                const string relationSql = """
                    INSERT INTO tbl_JobPostConversation
                    (
                        JobPostConversation_JobPostId,
                        JobPostConversation_ConversationId,
                        JobPostConversation_CreatedAt
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
                        ConversationId = conversationId.Value
                    },
                    transaction);
            }

            transaction.Commit();

            return new ApiResponse<int>
            {
                Success = true,
                Message = alreadyLinked > 0
                    ? "Conversation opened."
                    : "Connected to job post successfully.",
                Data = conversationId.Value
            };
        }
        catch (Exception ex)
        {
            transaction.Rollback();

            return new ApiResponse<int>
            {
                Success = false,
                Message = ex.Message
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
                Conversation_Id AS ConversationId,

                Conversation_ClientId AS ClientId,
                client.User_FullName AS ClientFullName,
                client.User_AvgRating AS ClientAvgRating,

                Conversation_WorkerId AS WorkerId,
                worker.User_FullName AS WorkerFullName,
                worker.User_AvgRating AS WorkerAvgRating,

                Conversation_CreatedAt AS CreatedAt,
                Conversation_LastMessageAt AS LastMessageAt

            FROM tbl_Conversation

            INNER JOIN tbl_User client
                ON client.User_Id = Conversation_ClientId

            INNER JOIN tbl_User worker
                ON worker.User_Id = Conversation_WorkerId

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

        const string jobPostsSql = """
            SELECT
                JobPost_Id AS JobPostId,
                JobPost_Title AS JobPostTitle,
                JobPost_Price AS JobPostPrice,

                Profession_Title AS JobPostProfession,
                City_Name AS JobPostCity,

                JobPostConversation_CreatedAt AS CreatedAt

            FROM tbl_JobPostConversation

            INNER JOIN tbl_JobPost
                ON JobPost_Id = JobPostConversation_JobPostId

            LEFT JOIN tbl_Profession
                ON Profession_Id = JobPost_ProfessionId

            LEFT JOIN tbl_City
                ON City_Id = JobPost_CityId

            WHERE JobPostConversation_ConversationId = @ConversationId;
            """;

        var jobPosts =
            await connection.QueryAsync<ConversationJobPostResp>(
                jobPostsSql,
                new { ConversationId = conversationId });
        
        var jobPostItems = jobPosts.Select(jobPost=> new ConversationItemResp{
            Type="JobPost",
            CreatedAt=jobPost.CreatedAt,
            JobPost=jobPost
        });

        // Normal messages
        const string messagesSql = """
            SELECT
                Message_Id MessageId,
                Message_SenderId SenderId,
                Message_SentAt CreatedAt,
                Message_Content Content,
                Message_IsRead IsRead
            FROM tbl_Message
            WHERE Message_ConversationId = @ConversationId;
            """;

        var messages =
            await connection.QueryAsync<ConversationMessageResp>(
                messagesSql,
                new { ConversationId = conversationId });

        var messageItems= messages.Select(message=> new ConversationItemResp{

                Type="Message",
                CreatedAt=message.CreatedAt,
                Message=message
        });

        // Hire offers
        const string offersSql = """
            SELECT
                HireOffer_Id HireOfferId,
                Conversation_ClientId AS SenderId,
                HireOffer_OfferedAt AS CreatedAt,

                HireOffer_JobPostId JobPostId,
                HireOffer_Title OfferTitle,
                HireOffer_Price OfferPrice,
                HireOffer_ScopeTerms ScopeTerms,
                HireOffer_Status OfferStatus,
                IsRead 

            FROM tbl_HireOffer 

            INNER JOIN tbl_Conversation 
                ON Conversation_Id = HireOffer_ConversationId

            WHERE HireOffer_ConversationId = @ConversationId;
            """;

        var offers =
            await connection.QueryAsync<ConversationHireOfferResp>(
                offersSql,
                new { ConversationId = conversationId });

        var offerItems= offers.Select(offer=>new ConversationItemResp{
            Type="Hire Offer",
            CreatedAt=offer.CreatedAt,
            HireOffer=offer
        });

        // Combine both types into one ordered timeline type 1 for normal messages and type 2 for the hire offer scpecial card message
        conversation.Items = messageItems
            .Concat(jobPostItems)
            .Concat(offerItems)
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
            WHERE Conversation_Id = @ConversationId
            AND (Conversation_ClientId = @UserId OR Conversation_WorkerId = @UserId);
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
                Message = "You do not have access to this conversation or no conversation exist between two users"
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
            OUTPUT INSERTED.Message_Id
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
            SET Conversation_LastMessageAt = GETDATE()
            WHERE Conversation_Id = @ConversationId;
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
            otherUserId = (int)conversation.Conversation_WorkerId;
        }
        else if ((int)conversation.Conversation_WorkerId == userId)
        {
            otherUserId = (int)conversation.Conversation_ClientId;
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
        if ((int)conversation.Conversation_WorkerId == userId)
        {
            const string offerSql = """
                UPDATE tbl_HireOffer
                SET IsRead = 1
                WHERE HireOffer_ConversationId = @ConversationId
                AND IsRead = 0;
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