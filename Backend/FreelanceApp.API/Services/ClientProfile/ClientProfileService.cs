using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Rating;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.ClientProfile;
using FreelanceApp.API.DTOs.Enums;
using FreelanceApp.API.DTOs.WorkerProfile;

namespace FreelanceApp.API.Services.ClientProfile;

public class ClientProfileService : IClientProfileService
{
    private readonly DbConnectionFactory _dbConnection;

    public ClientProfileService( DbConnectionFactory dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<ApiResponse<ClientProfileResp>> GetClientProfileAsync(int clientId)
    {
        using var connection =
            _dbConnection.CreateConnection();

        const string userSql = """
            SELECT
                User_Id ,
                User_FullName ,
                ISNULL(User_AvgRating, 0),
                ISNULL(User_ReviewCount, 0)
            FROM tbl_User
            WHERE User_Id = @ClientId
              AND User_Role = @ClientRole;
            """;

        var profile =
            await connection.QuerySingleOrDefaultAsync<ClientProfileResp>(
                userSql,
                new
                {
                    ClientId = clientId,

                    // Use your actual client role value.
                    ClientRole = 1
                });

        if (profile == null)
        {
            return new ApiResponse<ClientProfileResp>
            {
                Success = false,
                Message = "Client profile not found."
            };
        }

        // Fetch reviews for the client
        const string reviewsSql = """
            SELECT
                Review_Id,
                Review_ReviewerId,
                Review_Rating,
                User_FullName AS ReviewerFullName,
                Review_Comment,
                Review_CreatedAt
            FROM tbl_Review
            INNER JOIN tbl_User u
            ON User_Id = Review_ReviewerId
            WHERE Review_RevieweeId = @ClientId
            ORDER BY Review_CreatedAt DESC;
            """;

        var reviews =
            await connection.QueryAsync<ReviewResp>(
                reviewsSql,
                new { ClientId = clientId });

        profile.Reviews = reviews.ToList();

        const string photoSql = """
            SELECT
                Document_FileData,
                Document_ContentType
            FROM tbl_Document
            WHERE Document_UserId = @ClientId
            AND Document_Type = @DocumentType;
            """;

        var photo =
            await connection.QuerySingleOrDefaultAsync<ProfilePhotoData>(
                photoSql,
                new
                {
                    ClientId = clientId,
                    DocumentType = 3
                });

        profile.ProfilePhoto = photo?.Document_FileData;

        profile.ProfilePhotoContentType =
            photo?.Document_ContentType;

        return new ApiResponse<ClientProfileResp>
        {
            Success = true,
            Message = "Client profile retrieved successfully.",
            Data = profile
        };
    }
}