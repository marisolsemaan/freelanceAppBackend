using Dapper;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Rating;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Services.Verification;

namespace FreelanceApp.API.Services.Rating;

public class RatingService : IRatingService
{
    private readonly DbConnectionFactory _db;
    private readonly IUserVerificationService _verificationService;

    public RatingService(DbConnectionFactory db, IUserVerificationService vs)
    {
        _db = db;
        _verificationService= vs;
    }

    public async Task<ApiResponse<ReviewResp>> CreateReviewAsync(int reviewerId, CreateReviewReq request)
    {

        var isVerified = await _verificationService.IsUserVerifiedAsync(reviewerId);

        if (!isVerified)
        {
            return new ApiResponse<ReviewResp>
            {
                Success = false,
                Message = "Your account must be verified before you can submit a review."
            };
        }

        if (request.Review_Rating < 1 || request.Review_Rating > 5)
        {
            return new ApiResponse<ReviewResp>
            {
                Success = false,
                Message = "Rating must be between 1 and 5."
            };
        }

        await using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            // Get the participants of the hire offer
            const string hireOfferSql = """
            SELECT
                HireOffer_Id,
                HireOffer_Status,
                Conversation_ClientId,
                Conversation_WorkerId
            FROM tbl_HireOffer
            INNER JOIN tbl_Conversation
                ON Conversation_Id = HireOffer_ConversationId
            WHERE HireOffer_Id = @HireOfferId;
            """;

            var hireOffer = await connection.QuerySingleOrDefaultAsync<dynamic>(
                hireOfferSql,
                new
                {
                    HireOfferId = request.Review_HireOfferId
                },
                transaction);

            if (hireOffer is null)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<ReviewResp>
                {
                    Success = false,
                    Message = "Hire offer not found."
                };
            }

            int clientId = hireOffer.Conversation_ClientId;
            int workerId = hireOffer.Conversation_WorkerId;

            // The reviewer must be either the client or worker
            if (reviewerId != clientId && reviewerId != workerId)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<ReviewResp>
                {
                    Success = false,
                    Message = "You are not a participant in this hire offer."
                };
            }

            if ((short)hireOffer.HireOffer_Status != (short)HireOfferStatus.Accepted)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<ReviewResp>
                {
                    Success = false,
                    Message = "You can only review an accepted hire offer."
                };
            }

            // Determine the reviewee
            int revieweeId =
                reviewerId == clientId
                    ? workerId
                    : clientId;

            // Check if this user already reviewed this hire offer
            const string existingReviewSql = """
                SELECT COUNT(1)
                FROM tbl_Review
                WHERE Review_ReviewerId = @ReviewerId
                AND Review_HireOfferId = @HireOfferId;
                """;

            var alreadyReviewed = await connection.ExecuteScalarAsync<int>(
                existingReviewSql,
                new
                {
                    ReviewerId = reviewerId,
                    HireOfferId = request.Review_HireOfferId
                },
                transaction);

            if (alreadyReviewed > 0)
            {
                await transaction.RollbackAsync();

                return new ApiResponse<ReviewResp>
                {
                    Success = false,
                    Message = "You have already reviewed this hire offer."
                };
            }

            // Insert review
            const string insertSql = """
                INSERT INTO tbl_Review
                (
                    Review_RevieweeId,
                    Review_ReviewerId,
                    Review_Rating,
                    Review_Comment,
                    Review_CreatedAt,
                    Review_HireOfferId
                )
                OUTPUT
                    INSERTED.Review_Id,
                    INSERTED.Review_ReviewerId ,
                    INSERTED.Review_Rating ,
                    INSERTED.Review_Comment,
                    INSERTED.Review_CreatedAt 
                VALUES
                (
                    @RevieweeId,
                    @ReviewerId,
                    @Rating,
                    @Comment,
                    SYSUTCDATETIME(),
                    @HireOfferId
                );
                """;

            var review = await connection.QuerySingleAsync<ReviewResp>(
                insertSql,
                new
                {
                    RevieweeId = revieweeId,
                    ReviewerId = reviewerId,
                    Rating = request.Review_Rating,
                    Comment = request.Review_Comment,
                    HireOfferId = request.Review_HireOfferId
                },
                transaction);


            // Automatically update average rating and review count
            const string updateRatingSql = """
                UPDATE tbl_User
                SET
                    User_AvgRating = (
                        SELECT COALESCE(
                            AVG(CAST(Review_Rating AS DECIMAL(10,2))),
                            0
                        )
                        FROM tbl_Review
                        WHERE Review_RevieweeId = @RevieweeId
                    ),
                    User_ReviewCount = (
                        SELECT COUNT(*)
                        FROM tbl_Review
                        WHERE Review_RevieweeId = @RevieweeId
                    )
                WHERE User_Id = @RevieweeId;
                """;

            await connection.ExecuteAsync(
                updateRatingSql,
                new
                {
                    RevieweeId = revieweeId
                },
                transaction);


            // Everything succeeded
            await transaction.CommitAsync();

            return new ApiResponse<ReviewResp>
            {
                Success = true,
                Message = "Review submitted successfully.",
                Data = review
            };
        }
        catch(Exception ex)
        {
            await transaction.RollbackAsync();

            return new ApiResponse<ReviewResp>
            {
                Success = false,
                Message = $"Failed to submit review.{ex.Message}"
            };
        }
    }
}