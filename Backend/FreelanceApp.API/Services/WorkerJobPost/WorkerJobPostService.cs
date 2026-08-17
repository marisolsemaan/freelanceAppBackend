using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.JobPost;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Data;

namespace FreelanceApp.API.Services.WorkerJobPost;

public class WorkerJobPostService : IWorkerJobPostService
{
    private readonly DbConnectionFactory _dbConnection;

    public WorkerJobPostService(DbConnectionFactory dbC)
    {
        _dbConnection = dbC;
    }

    public async Task<ApiResponse<IEnumerable<WorkerJobPostResp>>> GetJobPostsAsync(
            int? cityId,
            int? professionId,
            JobPostBudgetType? type,
            decimal? maxPrice)
    {
        using var connection = _dbConnection.CreateConnection();

        if (maxPrice.HasValue && maxPrice <= 0)
        {
            return new ApiResponse<IEnumerable<WorkerJobPostResp>>
            {
                Success = false,
                Message = "Maximum price must be greater than zero."
            };
        }

        if (type.HasValue && !Enum.IsDefined(type.Value))
        {
            return new ApiResponse<IEnumerable<WorkerJobPostResp>>
            {
                Success = false,
                Message = "Invalid job post type."
            };
        }

        const string sql = """
            SELECT
                JobPost_Id ,
                JobPost_Title ,
                JobPost_Description,
                JobPost_Price,
                JobPost_BudgetType ,
                JobPost_ProfessionId,
                JobPost_CityId,
                JobPost_Status,
                JobPost_CreatedAt,

                JobPost_ClientId ,
                User_FullName ,
                User_AvgRating 

            FROM tbl_JobPost 

            INNER JOIN tbl_User 
                ON User_Id = JobPost_ClientId

            WHERE JobPost_Status = @OpenStatus

              AND (@CityId IS NULL
                   OR JobPost_CityId = @CityId)

              AND (@ProfessionId IS NULL
                   OR JobPost_ProfessionId = @ProfessionId)

              AND (@Type IS NULL
                   OR JobPost_BudgetType = @Type)

              AND (@MaxPrice IS NULL
                   OR JobPost_Price <= @MaxPrice)

            """;

        var jobs = await connection.QueryAsync<WorkerJobPostResp>(
            sql,
            new
            {
                CityId = cityId,
                ProfessionId = professionId,
                Type = type.HasValue ? (short?)type.Value : null,
                MaxPrice = maxPrice,
                OpenStatus = (short)JobPostStatus.Open
            });

        return new ApiResponse<IEnumerable<WorkerJobPostResp>>
        {
            Success = true,
            Message = "Available job posts retrieved successfully.",
            Data = jobs
        };
    }
}