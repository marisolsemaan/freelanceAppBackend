using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.HireOffer;
using FreelanceApp.API.Enums;

namespace FreelanceApp.API.Services.HireOffer;

public class HireOfferService : IHireOfferService
{
    private readonly DbConnectionFactory _dbConnection;

    public HireOfferService(
        DbConnectionFactory dbC)
    {
        _dbConnection = dbC;
    }

    public async Task<ApiResponse<HireOfferResp>> CreateHireOfferAsync(int clientId, int conversationId, HireOfferReq request)
    {
        using var connection =
            _dbConnection.CreateConnection();

        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "Offer title is required."
            };
        }

        if (request.Price <= 0)
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
        if (request.JobPostId.HasValue)
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
                    new { JobPostId = request.JobPostId.Value });

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
        }

        // // ONLY ONE PENDING OFFER per same job post titlw
        // const string pendingOfferSql = """
        //     SELECT COUNT(*)
        //     FROM tbl_HireOffer
        //     WHERE ConversationId = @ConversationId
        //       AND Status = @PendingStatus;
        //     """;

        // var pendingOffers =
        //     await connection.ExecuteScalarAsync<int>(
        //         pendingOfferSql,
        //         new
        //         {
        //             ConversationId = conversationId,
        //             PendingStatus = (int)HireOfferStatus.Pending
        //         });

        // if (pendingOffers > 0)
        // {
        //     return new ApiResponse<HireOfferResp>
        //     {
        //         Success = false,
        //         Message = "There is already a pending hire offer in this conversation."
        //     };
        // }

        // create the hire offer speciall card in the conversation between worker and client
        const string insertSql = """
            INSERT INTO tbl_HireOffer
            (
                Conversation_Id,
                Conversation_JobPostId,
                Conversation_Title,
                Conversation_Price,
                Conversation_OfferedAt,
                Conversation_Status,
                Conversation_ScopeTerms,
            )
            OUTPUT INSERTED.HireOffer_Id
            VALUES
            (
                @ConversationId,
                @JobPostId,
                @Title,
                @Price,
                GETDATE(),
                @Status,
                @ScopeTerms,
            );
            """;

        var hireOfferId =
            await connection.ExecuteScalarAsync<int>(
                insertSql,
                new
                {
                    Conversation_Id = conversationId,
                    request.JobPostId,
                    request.Title,
                    request.ScopeTerms,
                    request.Price,
                    Status = (short)HireOfferStatus.Pending
                });

        // update the  conversation's LastMessageAt to the current date and time to indicate that a new message (hire offer) has been sent
        const string updateConversationSql = """
            UPDATE tbl_Conversation
            SET LastMessageAt = GETDATE()
            WHERE Id = @ConversationId;
            """;

        await connection.ExecuteAsync(
            updateConversationSql,
            new { ConversationId = conversationId });

        //  Return offer so i can display it in the conversation's messages
        const string getOfferSql = """
            SELECT
                HireOffer_Id ,
                HireOffer_ConversationId,
                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price,
                HireOffer_Status,
                HireOffer_OfferedAt,
                HireOffer_ScopeTerms,
            FROM tbl_HireOffer
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
        using var connection =
            _dbConnection.CreateConnection();

        // check for the status value to be either accepted or rejected
        if (request.Status != HireOfferStatus.Accepted && request.Status != HireOfferStatus.Rejected)
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

        if ((int)offer.WorkerId != workerId)
        {
            return new ApiResponse<HireOfferResp>
            {
                Success = false,
                Message = "You are not the worker receiving this offer."
            };
        }

        if ((short)offer.Status !=
            (short)HireOfferStatus.Pending)
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
            SET Status = @Status
            WHERE HireOffer_Id = @HireOfferId
              AND Status = @PendingStatus;
            """;

        await connection.ExecuteAsync(
            updateSql,
            new
            {
                HireOfferId = hireOfferId,
                Status = (short)request.Status,
                PendingStatus = (short)HireOfferStatus.Pending
            });

        // return the updated hire offer details
        const string resultSql = """
            SELECT
                HireOffer_Id,
                HireOffer_ConversationId,
                HireOffer_JobPostId,
                HireOffer_Title,
                HireOffer_Price,
                HireOffer_ScopeTerms,
                HireOffer_Status,
                HireOffer_OfferedAt
            FROM tbl_HireOffer
            WHERE HireOffer_Id = @HireOfferId;
            """;

        var updatedOffer =
            await connection.QuerySingleAsync<HireOfferResp>(
                resultSql,
                new { HireOfferId = hireOfferId });

        return new ApiResponse<HireOfferResp>
        {
            Success = true,
            Message = request.Status == HireOfferStatus.Accepted
                ? "Hire offer accepted successfully."
                : "Hire offer rejected successfully.",
            Data = updatedOffer
        };
    }
}