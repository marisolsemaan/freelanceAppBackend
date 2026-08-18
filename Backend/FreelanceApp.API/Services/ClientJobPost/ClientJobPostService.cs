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

    public async Task<ApiResponse<ClientJobPostResp>> CreateJobPostAsync( int clientId, CreateJobPostReq request)
    {
        using var connection = _dbConnection.CreateConnection();

        // Basic validation
        if (string.IsNullOrWhiteSpace(request.JobPost_Title))
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Job title is required."
            };
        }

        if (string.IsNullOrWhiteSpace(request.JobPost_Description))
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Job description is required."
            };
        }

        if (request.JobPost_Price <= 0)
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Price must be greater than zero."
            };
        }

        if (!Enum.IsDefined(request.JobPost_BudgetType))
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Invalid job post type. fixed or hourly"
            };
        }

        const string professionSql = """
            SELECT COUNT(1)
            FROM tbl_Profession
            WHERE Profession_Id = @ProfessionId
            """;

        var professionExists = await connection.ExecuteScalarAsync<int>(
            professionSql,
            new
            {
                ProfessionId = request.JobPost_ProfessionId
            });

        if (professionExists == 0)
        {
            return new ApiResponse<ClientJobPostResp>
            {
                Success = false,
                Message = "Selected profession does not exist."
            };
        }

        if (request.JobPost_CityId.HasValue)
        {
            const string citySql = """
                SELECT COUNT(1)
                FROM tbl_City
                WHERE City_Id = @CityId
                AND City_Name <> 'All Cities'
                """;

            var cityExists = await connection.ExecuteScalarAsync<int>(
                citySql,
                new
                {
                    CityId = request.JobPost_CityId.Value
                });

            if (cityExists == 0)
            {
                return new ApiResponse<ClientJobPostResp>
                {
                    Success = false,
                    Message = "Selected city does not exist or is not available for job posts."
                };
            }
        }
        // Create the job post 
       
            const string insertSql = """
                INSERT INTO tbl_JobPost
                (
                    JobPost_Title,
                    JobPost_Description,
                    JobPost_Price,
                    JobPost_ProfessionId,
                    JobPost_CityId,
                    JobPost_ClientId,
                    JobPost_CreatedAt,
                    JobPost_Status,
                    JobPost_BudgetType
                )
                OUTPUT INSERTED.JobPost_Id
                VALUES
                (
                    @Title,
                    @Description,
                    @Price,
                    @ProfessionId,
                    @CityId,
                    @ClientId,
                    GETDATE(),
                    @Status,
                    @Type
                );
                """;

            var jobPostId = await connection.ExecuteScalarAsync<int>(
                insertSql,
                new
                {
                    Title = request.JobPost_Title,
                    Description = request.JobPost_Description,
                    Price = request.JobPost_Price,
                    ProfessionId = request.JobPost_ProfessionId,
                    CityId = request.JobPost_CityId,
                    ClientId = clientId,
                    Status = (short)JobPostStatus.Open,
                    Type = (short)request.JobPost_BudgetType
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

    public async Task<ApiResponse<object>> GetMyJobPostsAsync(int clientId)
    {
        using var connection = _dbConnection.CreateConnection();

        const string statsSql = """
            SELECT
                COUNT(*) AS TotalJobs,

                SUM(
                    CASE
                        WHEN JobPost_Status = @OpenStatus THEN 1
                        ELSE 0
                    END
                ) AS OpenJobs,

                SUM(
                    CASE
                        WHEN JobPost_Status = @ClosedStatus THEN 1
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
                JobPost_BudgetType ,
                JobPost_ProfessionId,
                JobPost_CityId,
                JobPost_Status,
                JobPost_CreatedAt,
                                            
                COUNT(DISTINCT JobPostConversation_ConversationId) AS ConversationCount

            FROM tbl_JobPost 

            LEFT JOIN tbl_JobPostConversation 
                ON JobPost_Id = JobPostConversation_JobPostId

            WHERE JobPost_ClientId = @ClientId

            GROUP BY
                JobPost_Id,
                JobPost_Title,
                JobPost_Description,
                JobPost_Price,
                JobPost_BudgetType,
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
            SET JobPost_Status = @ClosedStatus
            WHERE JobPost_Id = @JobPostId
              AND JobPost_ClientId = @ClientId
              AND JobPost_Status = @OpenStatus;
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
                COUNT(DISTINCT JobPostConversation_ConversationId) AS ConversationCount

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
            WHERE JobPost_ClientId = @ClientId
            AND JobPost_Status = @OpenStatus
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