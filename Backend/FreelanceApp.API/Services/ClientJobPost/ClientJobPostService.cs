using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.JobPost;
using FreelanceApp.API.Data;
using FreelanceApp.API.Enums;

namespace FreelanceApp.API.Services.ClientJobPost;

public class ClientJobPostService : IClientJobPostService
{
    private readonly DbConnectionFactory _dbConnection;

    public ClientJobPostService(DbConnectionFactory dbConnect)
    {
        _dbConnection = dbConnect;
    }

    public async Task<ApiResponse<ClientJobPostResp>> CreateOrUpdateJobPostAsync( int clientId, CreateUpdateJobPostReq request)
    {
        using var connection = _dbConnection.CreateConnection();

        // Basic validation
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Job title is required."
            };
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Job description is required."
            };
        }

        if (request.Price <= 0)
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Price must be greater than zero."
            };
        }

        if (!Enum.IsDefined(request.Type))
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Invalid job post type. fixed or hourly"
            };
        }

        // CREATE the job post 
        if (request.JobPostId == null)
        {
            const string insertSql = """
                INSERT INTO tbl_JobPost
                (
                    JobPost_Title,
                    JobPost_Description,
                    JobPost_Price,
                    JobPost_BudgetType,
                    JobPost_ProfessionId,
                    JobPost_Status,
                    JobPost_CityId,
                    JobPost_ClientId,
                    JobPost_CreatedAt
                )
                OUTPUT INSERTED.JobPost_Id
                VALUES
                (
                    @Title,
                    @Description,
                    @Price,
                    @Type,
                    @ProfessionId,
                    @Status,
                    @CityId,
                    @ClientId,
                    GETDATE()
                );
                """;

            var jobPostId = await connection.ExecuteScalarAsync<int>(
                insertSql,
                new
                {
                    request.Title,
                    request.Description,
                    request.Price,
                    Type = (short)request.Type,
                    request.ProfessionId,
                    Status = (short)JobPostStatus.Open,
                    request.CityId,
                    ClientId = clientId
                });

            var jobPost = await GetJobPostAsync(
                connection,
                clientId,
                jobPostId);

            return new ApiResponse<ClientJobPostResp>
            {
                Success = true,
                Message = "Job post created successfully.",
                Data = jobPost
            };
        }

        // UPDATE/edit the job post done by the client
        const string updateSql = """
            UPDATE tbl_JobPost
            SET
                JobPost_Title = @Title,
                JobPost_Description = @Description,
                JobPost_Price = @Price,
                JobPost_BudgetType = @Type,
                JobPost_ProfessionId = @ProfessionId,
                JobPost_CityId = @CityId
            WHERE JobPost_Id = @JobPostId
              AND JobPost_ClientId = @ClientId
              AND JobPost_Status = @OpenStatus;
            """;

        var affectedRows = await connection.ExecuteAsync(
            updateSql,
            new
            {
                request.Title,
                request.Description,
                request.Price,
                Type = (short)request.Type,
                request.ProfessionId,
                request.CityId,
                JobPostId = request.JobPostId.Value,
                ClientId = clientId,
                OpenStatus = (short)JobPostStatus.Open
            });

        if (affectedRows == 0)
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Job post was not found, does not belong to you, or is already closed."
            };
        }

        var updatedJobPost = await GetJobPostAsync(
            connection,
            clientId,
            request.JobPostId.Value);

        return new ApiResponse<ClientJobPostResp>
        {
            Success = true,
            Message = "Job post updated successfully.",
            Data = updatedJobPost
        };
    }

    public async Task<ApiResponse<object>> GetMyJobPostsAsync(int clientId)
    {
        using var connection = _dbConnection.CreateConnection();

        const string statsSql = """
            SELECT
                COUNT(*) AS TotalJobs,

                SUM(
                    CASE
                        WHEN Status = @OpenStatus THEN 1
                        ELSE 0
                    END
                ) AS OpenJobs,

                SUM(
                    CASE
                        WHEN Status = @ClosedStatus THEN 1
                        ELSE 0
                    END
                ) AS ClosedJobs,

                (
                    SELECT COUNT(*)
                    FROM tbl_JobPostConversation 
                    INNER JOIN tbl_JobPost 
                        ON JobPost_Id = JobPostConversation_JobPostId
                    WHERE JobPost_ClientId = @ClientId
                ) AS TotalConversations

            FROM tbl_JobPost

            WHERE JobPost_ClientId = @ClientId;
            """;

        const string jobsSql = """
            SELECT
                JobPost_Id ,
                JobPost_Title ,
                JobPost_Description ,
                JobPost_Price ,
                JobPost_Type ,
                JobPost_ProfessionId,
                JobPost_CityId,
                JobPost_Status,
                JobPost_CreatedAt,

                COUNT(JobPostConversation_Id) AS ConversationCount

            FROM tbl_JobPost 

            LEFT JOIN tbl_JobPostConversation 
                ON JobPost_Id = JobPostConversation_JobPostId

            WHERE JobPost_ClientId = @ClientId

            GROUP BY
                JobPost_Id,
                JobPost_Title,
                JobPost_Description,
                JobPost_Price,
                JobPost_Type,
                JobPost_ProfessionId,
                JobPost_CityId,
                JobPost_Status,
                JobPost_CreatedAt

            ORDER BY JobPost_CreatedAt DESC;
            """;

        var parameters = new
        {
            ClientId = clientId,
            OpenStatus = (short)JobPostStatus.Open,
            ClosedStatus = (short)JobPostStatus.Closed
        };

        var stats = await connection.QuerySingleAsync<JobPostStatsResp>(
            statsSql,
            parameters);

        var jobs = await connection.QueryAsync<ClientJobPostResp>(
            jobsSql,
            new { ClientId = clientId });

        var data = new
        {
            Stats = stats,
            Jobs = jobs
        };

        return new ApiResponse<object>
        {
            Success = true,
            Message = "Job posts retrieved successfully.",
            Data = data
        };
    }

    public async Task<ApiResponse<object>> CloseJobPostAsync(int clientId, int jobPostId)
    {
        using var connection = _dbConnection.CreateConnection();

        const string sql = """
            UPDATE tbl_JobPost
            SET Status = @ClosedStatus
            WHERE JobPost_Id = @JobPostId
              AND ClientId = @ClientId
              AND Status = @OpenStatus;
            """;

        var affectedRows = await connection.ExecuteAsync(
            sql,
            new
            {
                JobPostId = jobPostId,
                ClientId = clientId,
                OpenStatus = (short)JobPostStatus.Open,
                ClosedStatus = (short)JobPostStatus.Closed
            });

        if (affectedRows == 0)
        {
            return new ApiResponse<object>
            {
                Success = false,
                Message = "Job post was not found, does not belong to you, or is already closed."
            };
        }

        return new ApiResponse<object>
        {
            Success = true,
            Message = "Job post closed successfully."
        };
    }

    private async Task<ClientJobPostResp?> GetJobPostAsync(System.Data.IDbConnection connection, int clientId, int jobPostId)
    {
        const string sql = """
            SELECT
                JobPost_Id ,
                JobPost_Title ,
                JobPost_Description ,
                JobPost_Price ,
                JobPost_BudgetType,
                JobPost_ProfessionId,
                JobPost_CityId,
                JobPost_Status,
                JobPost_CreatedAt,
                COUNT(JobPostConversation_Id) AS ConversationCount

            FROM tbl_JobPost 

            LEFT JOIN tbl_JobPostConversation 
                ON JobPostConversation_JobPostId = JobPost_Id

            WHERE JobPost_Id = @JobPostId
              AND JobPost_ClientId = @ClientId

            GROUP BY
                JobPost_Id,
                JobPost_Title,
                JobPost_Description,
                JobPost_Price,
                JobPost_BudgetType,
                JobPost_ProfessionId,
                JobPost_CityId,
                JobPost_Status,
                JobPost_CreatedAt;
            """;

        return await connection.QuerySingleOrDefaultAsync<ClientJobPostResp>(
            sql,
            new
            {
                JobPostId = jobPostId,
                ClientId = clientId
            });
    }

    public async Task<ApiResponse<IEnumerable<JobPostTitleResp>>> GetJobPostTitlesAsync(int clientId)
    {
        using var connection = _dbConnection.CreateConnection();

        const string sql = """
            SELECT
                JobPost_Id ,
                JobPost_Title
            FROM tbl_JobPost
            WHERE ClientId = @ClientId
            AND Status = @OpenStatus
            """;

        var titles = await connection.QueryAsync<JobPostTitleResp>(
            sql,
            new
            {
                ClientId = clientId,
                OpenStatus = (short)JobPostStatus.Open
            });

        return new ApiResponse<IEnumerable<JobPostTitleResp>>
        {
            Success = true,
            Message = "Job post titles retrieved successfully.",
            Data = titles
        };
    }
}