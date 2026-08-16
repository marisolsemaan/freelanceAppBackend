using Dapper;
using FreelanceApp.API.DTOs.Admin;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Data;
using FreelanceApp.API.Services;
using System.Data;

namespace FreelanceApp.API.Services.Admin;

public class AdminVerificationService : IAdminVerificationService
{
    private readonly DbConnectionFactory _connection;

    public AdminVerificationService(DbConnectionFactory c)
    {
        _connection = c;
    }

    public async Task<AdminVerificationStatsDto> GetStatisticsAsync()
    {
        using var connection = _connection.CreateConnection();

        const string sql = """
            SELECT
                SUM(
                    CASE
                        WHEN UserVerification_Status = @Pending
                        THEN 1
                        ELSE 0
                    END
                )  Pending,

                SUM(
                    CASE
                        WHEN UserVerification_Status = @Approved
                        THEN 1
                        ELSE 0
                    END
                )  Approved,

                SUM(
                    CASE
                        WHEN UserVerification_Status = @Rejected
                        THEN 1
                        ELSE 0
                    END
                )  Rejected

            FROM tbl_UserVerification 

            INNER JOIN tbl_User
                ON User_Id = UserVerification_UserId

            WHERE User_Role IN (@Client, @Worker);
            """;

        return await connection.QuerySingleAsync<AdminVerificationStatsDto>(
            sql,
            new
            {
                Pending =
                    (short)UserVerificationStatus.Pending,

                Approved =
                    (short)UserVerificationStatus.Approved,

                Rejected =
                    (short)UserVerificationStatus.Rejected,

                Client =
                    (short)UserRole.Client,

                Worker =
                    (short)UserRole.Worker
            });
    }

    // Get pending users
    public async Task<IEnumerable<AdminPendingUserDto>> GetPendingUsersAsync()
    {
        using var connection =
            _connection.CreateConnection();

        const string sql = """
            SELECT
                User_Id,
                User_FullName,
                User_Email,
                User_Phone,
                User_Role,
                UserVerification_Status,
                User_CreatedAt 
            FROM tbl_User 
            INNER JOIN tbl_UserVerification 
                ON UserVerification_UserId = User_Id
            WHERE UserVerification_Status = @Pending
              AND User_Role IN (@Client, @Worker)
            """;

        return await connection.QueryAsync<AdminPendingUserDto>(
            sql,
            new
            {
                Pending =
                    (short)UserVerificationStatus.Pending,

                Client =
                    (short)UserRole.Client,

                Worker =
                    (short)UserRole.Worker
            });
    }

    // Get user and doc info
    public async Task<AdminVerificationDetailsDto?> GetUserVerificationAsync(int userId)
    {
        using var connection =
            _connection.CreateConnection();

        const string userSql = """
            SELECT
                User_Id,
                User_FullName,
                User_Email ,
                User_Phone,
                User_Role ,
                UserVerification_Status,
                User_CreatedAt 
            FROM tbl_User 
            INNER JOIN tbl_UserVerification 
                ON UserVerification_UserId = User_Id
            WHERE User_Id = @UserId
              AND User_Role IN (@Client, @Worker);
            """;

        var user =
            await connection.QuerySingleOrDefaultAsync<
                AdminVerificationDetailsDto>(
                userSql,
                new
                {
                    UserId = userId,

                    Client =
                        (short)UserRole.Client,

                    Worker =
                        (short)UserRole.Worker
                });

        if (user == null)
            return null;

        const string documentSql = """
            SELECT
                Document_Id ,
                Document_Type ,
                Document_FileName,
                Document_ContentType,
                Document_UploadedAt 
            FROM tbl_Document
            WHERE Document_UserId = @UserId
            """;

        var documents =
            await connection.QueryAsync<AdminDocumentDto>(documentSql, new { UserId = userId });

        user.Documents = documents.ToList();

        return user;
    }

    // retrieve the document data file
    public async Task<AdminDocumentFileDto?> GetDocumentAsync(int userId, int documentId)
    {
        using var connection =
            _connection.CreateConnection();

        const string sql = """
            SELECT
                Document_Id ,
                Document_FileName ,
                Document_ContentType ,
                Document_FileData 
            FROM tbl_Document
            WHERE Document_Id = @DocumentId
              AND Document_UserId = @UserId;
            """;

        return await connection.QuerySingleOrDefaultAsync<AdminDocumentFileDto>(sql,
            new
            {
                DocumentId = documentId,
                UserId = userId
            });
    }

    public async Task ApproveUserAsync(int userId, int adminId)
    {
        using var connection =
            _connection.CreateConnection();

        if (connection.State != ConnectionState.Open)
            connection.Open();

        using var transaction =
            connection.BeginTransaction();

        try
        {   // check if the admin is authorized to approve users
            const string adminSql = """
                SELECT COUNT(1)

                FROM tbl_User

                WHERE User_Id = @AdminId
                  AND User_Role = @AdminRole;
                """;

            var isAdmin =
                await connection.ExecuteScalarAsync<int>(
                    adminSql,
                    new
                    {
                        AdminId = adminId,

                        AdminRole =
                            (short)UserRole.Admin
                    },
                    transaction);

            if (isAdmin == 0)
                throw new UnauthorizedAccessException(
                    "Only admins can approve users.");

            // retrieve the verification status and role of the user 
            const string verificationSql = """
                SELECT
                    UserVerification_Status AS Status,
                    User_Role AS Role

                FROM tbl_UserVerification 

                INNER JOIN tbl_User
                    ON User_Id = UserVerification_UserId

                WHERE UserVerification_UserId = @UserId;
                """;

            var verification =
                await connection.QuerySingleOrDefaultAsync<VerificationInfo>(verificationSql,
                    new { UserId = userId },
                    transaction);

            if (verification == null)
                throw new KeyNotFoundException(
                    "Verification request not found.");

            // the admin does not need verification
            if (verification.Role ==(short)UserRole.Admin)
            {
                throw new InvalidOperationException(
                    "Admin users cannot be verified through this flow.");
            }

           //check users pending status first before approving
            if (verification.Status !=(short)UserVerificationStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Only pending users can be approved.");
            }

            // 5. Get user's documents
            const string documentsSql = """
                SELECT Document_Type

                FROM tbl_Document

                WHERE Document_UserId = @UserId;
                """;

            var documentTypes =
                (await connection.QueryAsync<short>(
                    documentsSql,
                    new { UserId = userId },
                    transaction))
                .ToHashSet();

            // check if every user has an ID
            if (!documentTypes.Contains((short)DocumentType.ID))
            {
                throw new InvalidOperationException(
                    "User cannot be approved because ID is missing.");
            }

            //  Worker needs ProfessionProof
            if (verification.Role ==(short)UserRole.Worker)
            {
                if (!documentTypes.Contains((short)DocumentType.ProfessionProof))
                {
                    throw new InvalidOperationException(
                        "Worker cannot be approved because profession proof is missing.");
                }
            }

            //  Update verification
            const string updateSql = """
                UPDATE tbl_UserVerification

                SET
                    UserVerification_Status = @Status,
                    UserVerification_AdminId = @AdminId,
                    UserVerification_VerifiedAt = @VerifiedAt

                WHERE UserVerification_UserId = @UserId;
                """;

            await connection.ExecuteAsync(updateSql,
                new
                {
                    UserId = userId,

                    AdminId = adminId,

                    Status =
                        (short)UserVerificationStatus.Approved,

                    VerifiedAt = DateTime.UtcNow
                },
                transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task RejectUserAsync(int userId, int adminId)
    {
        using var connection =
            _connection.CreateConnection();

        if (connection.State != ConnectionState.Open)
            connection.Open();

        using var transaction =
            connection.BeginTransaction();

        try
        {
            //  Verify user is ana authorized Admin
            const string adminSql = """
                SELECT COUNT(1)

                FROM tbl_User

                WHERE User_Id = @AdminId
                  AND User_Role = @AdminRole;
                """;

            var isAdmin =
                await connection.ExecuteScalarAsync<int>( adminSql,
                    new
                    {
                        AdminId = adminId,

                        AdminRole =
                            (short)UserRole.Admin
                    },
                    transaction);

            if (isAdmin == 0)
                throw new UnauthorizedAccessException(
                    "Only admins can reject users.");

            //  Get current status should be pending to reject
            const string statusSql = """
                SELECT UserVerification_Status

                FROM tbl_UserVerification

                WHERE UserVerification_UserId = @UserId;
                """;

            var status =
                await connection.QuerySingleOrDefaultAsync<short?>( statusSql,
                    new { UserId = userId },
                    transaction);

            if (status == null)
                throw new KeyNotFoundException("Verification request not found.");

            // Only Pending can be rejected
            if (status.Value !=(short)UserVerificationStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Only pending users can be rejected.");
            }

            // Update verification
        
            const string updateSql = """
                UPDATE tbl_UserVerification

                SET
                    UserVerification_Status = @Status,
                    UserVerification_AdminId = @AdminId,
                    UserVerification_VerifiedAt = @VerifiedAt

                WHERE UserVerification_UserId = @UserId;
                """;

            await connection.ExecuteAsync( updateSql,
                new
                {
                    UserId = userId,

                    AdminId = adminId,

                    Status =
                        (short)UserVerificationStatus.Rejected,

                    VerifiedAt = DateTime.UtcNow
                },
                transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private class VerificationInfo
    {
        public short Status { get; set; }

        public short Role { get; set; }
    }
}