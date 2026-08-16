using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Rating;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.ClientProfile;

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
                Review_Rating,
                Review_Comment,
                Review_CreatedAt
            FROM tbl_Review
            WHERE RatedUserId = @ClientId
            """;

        var reviews =
            await connection.QueryAsync<ReviewResp>(
                reviewsSql,
                new { ClientId = clientId });

        profile.Reviews = reviews;

        return new ApiResponse<ClientProfileResp>
        {
            Success = true,
            Message = "Client profile retrieved successfully.",
            Data = profile
        };
    }
}