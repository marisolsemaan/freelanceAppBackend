using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Lookup;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.WorkerProfile;


namespace FreelanceApp.API.Services.Lookup;

public class LookupService : ILookupService
{
    private readonly DbConnectionFactory _dbConnection;

    public LookupService(DbConnectionFactory dbConnection)
    {
        _dbConnection = dbConnection;
    }

    public async Task<ApiResponse<IEnumerable<ProfessionResp>>> GetProfessionsAsync()
    {
        using var connection = _dbConnection.CreateConnection();

        const string sql = """
            SELECT
                Profession_Id,
                Profession_Title
            FROM tbl_Profession
            ORDER BY Profession_Title;
            """;

        var professions = await connection.QueryAsync<ProfessionResp>(sql);

        // if(professions == null || !professions.Any())
        // {
        //     return new ApiResponse<IEnumerable<ProfessionResp>>
        //     {
        //         Success = false,
        //         Message = "No professions found or an error occured",
        //         Data = Enumerable.Empty<ProfessionResp>()
        //     };
        // }

        return new ApiResponse<IEnumerable<ProfessionResp>>
        {
            Success = true,
            Message = "Professions retrieved successfully.",
            Data = professions
        };
    }

    public async Task<ApiResponse<IEnumerable<CityResp>>> GetCitiesAsync()
    {
        using var connection = _dbConnection.CreateConnection();

        const string sql = """
            SELECT
                City_Id,
                City_Name
            FROM tbl_City
            WHERE City_Name <> 'All Cities'
            ORDER BY City_Name;
            """;

        var cities = await connection.QueryAsync<CityResp>(sql);



        return new ApiResponse<IEnumerable<CityResp>>
        {
            Success = true,
            Message = "Cities retrieved successfully.",
            Data = cities
        };
    }

    public async Task<ApiResponse<ProfessionResp>> CreateProfessionAsync(CreateProfessionReq request, int workerId)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new ApiResponse<ProfessionResp>
            {
                Success = false,
                Message = "Profession title is required."
            };
        }

        await using var connection = _dbConnection.CreateConnection();
        var title = request.Title.Trim();

        const string existingSql = """
            SELECT 
                Profession_Id,
                Profession_Title
            FROM tbl_Profession
            WHERE LOWER(LTRIM(RTRIM(Profession_Title))) = LOWER(@Title);
            """;

        var existing = await connection.QuerySingleOrDefaultAsync<ProfessionResp>(
            existingSql,
            new { Title = title });

        if (existing != null)
        {
            return new ApiResponse<ProfessionResp>
            {
                Success = true,
                Message = "Profession already exists.",
                Data = existing
            };
        }

        const string insertSql = """
            INSERT INTO tbl_Profession (Profession_Title)
            OUTPUT INSERTED.Profession_Id, INSERTED.Profession_Title
            VALUES (@Title);
            """;

        var newProfession = await connection.QuerySingleAsync<ProfessionResp>(
            insertSql,
            new { Title = title });

        const string ProfessionWorkerRelation= """
        INSERT INTO tbl_ProfessionWorker
        (
            ProfessionWorker_WorkerId,
            ProfessionWorker_ProfessionId
        )
        VALUES
        (
            @WorkerId,
            @ProfessionId
        );
        """;

        await connection.ExecuteAsync(
            ProfessionWorkerRelation,
            new {
                WorkerId= workerId,
                ProfessionId=newProfession.Profession_Id
            }
        );

        return new ApiResponse<ProfessionResp>
        {
            Success = true,
            Message = "Profession created successfully.",
            Data = newProfession
        };
    }
}