using Dapper;
using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Lookup;
using FreelanceApp.API.Data;

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
}