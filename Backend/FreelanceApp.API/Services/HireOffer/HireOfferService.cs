using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.HireOffer;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Services.Verification;

namespace FreelanceApp.API.Services.HireOffer;

public class HireOfferService : IHireOfferService
{
    private readonly DbConnectionFactory _dbConnection;

    private readonly IUserVerificationService _verificationService;

    public HireOfferService(DbConnectionFactory dbC,IUserVerificationService vs )
    {
        _dbConnection = dbC;
        _verificationService=vs;
    }

    public async Task<ApiResponse<HireOfferResp>> CreateHireOfferAsync(int clientId, int conversationId, HireOfferReq request)
    {
        var isVerified = await _verificationService.IsUserVerifiedAsync(clientId);

        if (!isVerified)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Your account must be verified before you can send a hire offer."
            };
        }

        using var connection =
            _dbConnection.CreateConnection();

        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.HireOffer_Title))
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Offer title is required."
            };
        }
        //NULL?
        if (request.HireOffer_Price <= 0)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Offer price must be greater than zero."
            };
        }

        // Verify that the conversation exists and belongs to the client
        const string conversationSql = """
            SELECT
                Conversation_Id,
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
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Conversation not found."
            };
        }

        if ((int)conversation.Conversation_ClientId != clientId)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "You are not the client of this conversation."
            };
        }

        // If job post title was selected as a hire offer
        if (request.HireOffer_JobPostId.HasValue)
        {
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
                    new { JobPostId = request.HireOffer_JobPostId.Value });

            if (jobPost == null)
            {
                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message = "Job post not found."
                };
            }

            if ((int)jobPost.JobPost_ClientId != clientId)
            {
                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message = "You can only use your own job posts."
                };
            }

            // We only allow offers from open jobs.
            if ((short)jobPost.JobPost_Status != (short)JobPostStatus.Open)
            {
                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message = "This job post is closed."
                };
            }
            // send one hire offer at a time until worker update status so later when we want to close a job (same job post)
            const string activeOfferSql = """
                SELECT COUNT(1)
                FROM tbl_HireOffer
                WHERE HireOffer_ConversationId =
                    @ConversationId
                AND HireOffer_JobPostId =
                    @JobPostId
                AND HireOffer_Status IN
                (
                    @PendingStatus,
                    @AcceptedStatus
                );
                """;

            var activeOfferCount =
                await connection.ExecuteScalarAsync<int>(
                    activeOfferSql,
                    new
                    {
                        ConversationId = conversationId,

                        JobPostId =
                            request.HireOffer_JobPostId.Value,

                        PendingStatus =
                            (short)HireOfferStatus.Pending,

                        AcceptedStatus =
                            (short)HireOfferStatus.Accepted
                    }
                );

            if (activeOfferCount > 0)
            {
                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message =
                        "There is already an active hire offer for this job post in this conversation."
                };
            }
        }

        // create the hire offer speciall card in the conversation between worker and client
        const string insertSql = """
            INSERT INTO tbl_HireOffer
            (
                HireOffer_ConversationId,
                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price,
                HireOffer_Status,
                HireOffer_OfferedAt,
                HireOffer_ScopeTerms
            )
            OUTPUT INSERTED.HireOffer_Id
            VALUES
            (
                @ConversationId,
                @JobPostId,
                @Title,
                @Price,
                @Status,
                GETDATE(),
                @ScopeTerms
            );
            """;

        var hireOfferId =
            await connection.ExecuteScalarAsync<int>(
                insertSql,
                new
                {
                    ConversationId = conversationId,
                    JobPostId=request.HireOffer_JobPostId,
                    Title=request.HireOffer_Title,
                    Price=request.HireOffer_Price,
                    Status = (short)HireOfferStatus.Pending,
                    ScopeTerms=request.HireOffer_ScopeTerms,
                });

        // update the  conversation's LastMessageAt to the current date and time to indicate that a new message (hire offer) has been sent
        const string updateConversationSql = """
            UPDATE tbl_Conversation
            SET Conversation_LastMessageAt = GETDATE()
            WHERE Conversation_Id = @ConversationId;
            """;

        await connection.ExecuteAsync(
            updateConversationSql,
            new { ConversationId = conversationId });

        //  Return offer so i can display it in the conversation's messages
        const string getOfferSql = """
            SELECT
                HireOffer_Id ,
                HireOffer_ConversationId,
                Conversation_WorkerId AS HireOffer_WorkerId,
                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price, 
                HireOffer_OfferedAt,
                HireOffer_Status,
                HireOffer_ScopeTerms
            FROM tbl_HireOffer
            INNER JOIN tbl_Conversation 
            ON Conversation_Id = HireOffer_ConversationId
            WHERE HireOffer_Id = @HireOfferId;
            """;

        var offer =
            await connection.QuerySingleAsync<HireOfferResp>(
                getOfferSql,
                new { HireOfferId = hireOfferId });

        return new ApiResponse<HireOfferResp>
        {
            Success = true,
            Message = "Hire offer sent successfully.",
            Data = offer
        };
    }

    public async Task<ApiResponse<HireOfferResp>>  UpdateOfferStatusAsync(int workerId, int hireOfferId, UpdateHireOfferStatusReq request)
    {
        var isVerified = await _verificationService.IsUserVerifiedAsync(workerId);

        if (!isVerified)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Your account must be verified by the admin"
            };
        }

        using var connection =
            _dbConnection.CreateConnection();

        // check for the status value to be either accepted or rejected
        if (request.HireOffer_Status != HireOfferStatus.Accepted && request.HireOffer_Status != HireOfferStatus.Rejected)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Invalid hire offer status."
            };
        }

        // Verify the worker is the recipient of the hire offer and that the offer is still pending
        const string offerSql = """
            SELECT
                HireOffer_Id,
                HireOffer_ConversationId,
                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price,
                HireOffer_Status,
                HireOffer_OfferedAt,
                HireOffer_ScopeTerms ,
                Conversation_WorkerId

            FROM tbl_HireOffer 

            INNER JOIN tbl_Conversation 
            ON Conversation_Id = HireOffer_ConversationId

            WHERE HireOffer_Id = @HireOfferId;
            """;

        var offer =
            await connection.QuerySingleOrDefaultAsync<dynamic>(
                offerSql,
                new { HireOfferId = hireOfferId });

        if (offer == null)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Hire offer not found."
            };
        }

        if ((int)offer.Conversation_WorkerId != workerId)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "You are not the worker receiving this offer."
            };
        }

        if ((short)offer.HireOffer_Status != (short)HireOfferStatus.Pending)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "This hire offer has already been processed."
            };
        }

        //update the hire offer status to either accepted or rejected
        const string updateSql = """
            UPDATE tbl_HireOffer
            SET HireOffer_Status = @Status
            WHERE HireOffer_Id = @HireOfferId
              AND HireOffer_Status = @PendingStatus;
            """;

        await connection.ExecuteAsync(
            updateSql,
            new
            {
                HireOfferId = hireOfferId,
                Status = (short)request.HireOffer_Status,
                PendingStatus = (short)HireOfferStatus.Pending
            });

        // return the updated hire offer details
        const string resultSql = """
            SELECT
                HireOffer_Id,
                HireOffer_ConversationId,
                Conversation_WorkerId HireOffer_WorkerId,
                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price,
                HireOffer_ScopeTerms,
                HireOffer_Status,
                HireOffer_OfferedAt
            FROM tbl_HireOffer
            INNER JOIN tbl_Conversation
                ON Conversation_Id = HireOffer_ConversationId
            WHERE HireOffer_Id = @HireOfferId;
            """;

        var updatedOffer =
            await connection.QuerySingleAsync<HireOfferResp>(
                resultSql,
                new { HireOfferId = hireOfferId });

        return new ApiResponse<HireOfferResp>
        {
            Success = true,
            Message = request.HireOffer_Status == HireOfferStatus.Accepted
                ? "Hire offer accepted successfully."
                : "Hire offer rejected successfully.",
            Data = updatedOffer
        };
    }

    public async Task<ApiResponse<HireOfferResp>> CompleteHireOfferAsync(int clientId,int hireOfferId)
    {
        var isVerified =await _verificationService.IsUserVerifiedAsync(clientId);

        if (!isVerified)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Your account must be verified before completing a hire offer."
            };
        }

        await using var connection =_dbConnection.CreateConnection();

        await connection.OpenAsync();

        await using var transaction =
            await connection.BeginTransactionAsync();

        try
        {
            const string offerSql = """
                SELECT
                    HireOffer_Id,
                    HireOffer_ConversationId,
                    HireOffer_JobPostId,
                    HireOffer_Title,
                    HireOffer_Price,
                    HireOffer_Status,
                    HireOffer_OfferedAt,
                    HireOffer_ScopeTerms,

                    Conversation_ClientId,
                    Conversation_WorkerId

                FROM tbl_HireOffer

                INNER JOIN tbl_Conversation
                    ON Conversation_Id = HireOffer_ConversationId

                WHERE HireOffer_Id = @HireOfferId;
                """;

            var offer =
                await connection.QuerySingleOrDefaultAsync<dynamic>(
                    offerSql,
                    new
                    {
                        HireOfferId = hireOfferId
                    },
                    transaction);

            if (offer == null)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message = "Hire offer not found."
                };
            }

            if ((int)offer.Conversation_ClientId != clientId)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message =
                        "You are not the client of this hire offer."
                };
            }

            if ((short)offer.HireOffer_Status !=
                (short)HireOfferStatus.Accepted)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message = "Only an accepted hire offer can be completed."
                };
            }

            const string completeOfferSql = """
                UPDATE tbl_HireOffer
                SET HireOffer_Status = @CompletedStatus
                WHERE HireOffer_Id = @HireOfferId
                AND HireOffer_Status = @AcceptedStatus;
                """;

            var affectedRows =
                await connection.ExecuteAsync(
                    completeOfferSql,
                    new
                    {
                        HireOfferId = hireOfferId,

                        CompletedStatus =
                            (short)HireOfferStatus.Completed,

                        AcceptedStatus =
                            (short)HireOfferStatus.Accepted
                    },
                    transaction);

            if (affectedRows == 0)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<HireOfferResp>
                {
                    Success = false,
                    Message =
                        "This hire offer could not be completed."
                };
            }

            // If this offer came from a job post,
            // close only that job post inside this conversation.
            if (offer.HireOffer_JobPostId != null)
            {
                const string closeConversationJobPostSql = """
                    UPDATE tbl_JobPostConversation
                    SET JobPostConversation_IsActive = 1
                    WHERE JobPostConversation_ConversationId =
                        @ConversationId
                    AND JobPostConversation_JobPostId =
                        @JobPostId;
                    """;

                await connection.ExecuteAsync(
                    closeConversationJobPostSql,
                    new
                    {
                        ConversationId =
                            (int)offer.HireOffer_ConversationId,

                        JobPostId =
                            (int)offer.HireOffer_JobPostId
                    },
                    transaction);
            }

            await transaction.CommitAsync();

            var result = new HireOfferResp
            {
                HireOffer_Id = offer.HireOffer_Id,
                HireOffer_ConversationId =
                    offer.HireOffer_ConversationId,

                HireOffer_JobPostId =
                    offer.HireOffer_JobPostId,

                HireOffer_Title =
                    offer.HireOffer_Title,

                HireOffer_Price =
                    offer.HireOffer_Price,

                HireOffer_ScopeTerms =
                    offer.HireOffer_ScopeTerms,

                HireOffer_Status =
                    HireOfferStatus.Completed,

                HireOffer_OfferedAt =
                    offer.HireOffer_OfferedAt
            };

            return new ApiResponse<HireOfferResp>
            {
                Success = true,
                Message = "Hire offer completed successfully.",
                Data = result
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();

            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = $"Failed to complete hire offer. {ex.Message}"
            };
        }
    }
}