using Dapper;

using FreelanceApp.API.Data;

using FreelanceApp.API.Enums;

namespace FreelanceApp.API.Services.Verification;

public class UserVerificationService : IUserVerificationService
{
    private readonly DbConnectionFactory _db;

    public UserVerificationService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<bool> IsUserVerifiedAsync(int userId)
    {
        using var connection = _db.CreateConnection();

        const string sql = """
            SELECT COUNT(1)
            FROM tbl_UserVerification
            WHERE UserVerification_UserId = @UserId
              AND UserVerification_Status = @ApprovedStatus;
            """;

        var count = await connection.ExecuteScalarAsync<int>(
            sql,
            new
            {
                UserId = userId,
                ApprovedStatus = (short)UserVerificationStatus.Approved
            });

        return count > 0;
    }
}