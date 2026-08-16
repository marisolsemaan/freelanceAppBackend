using Dapper;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.WorkerProfile;
using FreelanceApp.API.Enums;
using WorkerProfileModel = FreelanceApp.API.Models.WorkerProfile.WorkerProfile;
using FreelanceApp.API.Models.Auth;

namespace FreelanceApp.API.Services.WorkerProfile;

public class WorkerProfileService : IWorkerProfileService
{
    private readonly DbConnectionFactory _db;

    public WorkerProfileService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<(string message, GetWorkerProfileResp? profile)> GetWorkerProfileAsync(int workerId)
    {
        await using var connection = _db.CreateConnection();

        // Get basic user information
        const string userSql = """
            SELECT
                User_Id,
                User_FullName,
                User_AvgRating,
                User_ReviewCount
            FROM tbl_User
            WHERE User_Id = @WorkerId
              AND User_Role = @Role;
            """;

        var user = await connection.QuerySingleOrDefaultAsync<User>(
            userSql,
            new { WorkerId = workerId, Role = (short)UserRole.Worker });

        if (user is null)
            return ("User not found", null);


        // Get worker profile information
        const string workerProfileSql = """
            SELECT
                WorkerProfile_HourlyRate,
                WorkerProfile_AboutMe,
                WorkerProfile_Skills
            FROM tbl_WorkerProfile
            WHERE WorkerProfile_UserId = @WorkerId;
            """;

        var workerProfile =
            await connection.QuerySingleOrDefaultAsync<WorkerProfileModel>(
                workerProfileSql,
                new { WorkerId = workerId });

        if (workerProfile is null)
            return ("Worker profile not found", null);


        // Get professions
        const string professionsSql = """
            SELECT
                Profession_Id,
                Profession_Title
            FROM tbl_ProfessionWorker 
            INNER JOIN tbl_Profession 
                ON tbl_Profession.Profession_Id = tbl_ProfessionWorker.ProfessionWorker_ProfessionId
            WHERE tbl_ProfessionWorker.ProfessionWorker_WorkerId = @WorkerId
            ORDER BY tbl_Profession.Profession_Title;
            """;

        var professions = (await connection.QueryAsync<ProfessionDto>(
            professionsSql,
            new { WorkerId = workerId }))
            .ToList();


        // Get cities
        const string citiesSql = """
            SELECT
                City_Id,
                City_Name
            FROM tbl_CityWorker 
            INNER JOIN tbl_City 
                ON tbl_City.City_Id = tbl_CityWorker.CityWorker_CityId
            WHERE tbl_CityWorker.CityWorker_WorkerId = @WorkerId
            ORDER BY tbl_City.City_Name;
            """;

        var cities = (await connection.QueryAsync<CityDto>(
            citiesSql,
            new { WorkerId = workerId }))
            .ToList();


        // Get profile photo
        const string photoSql = """
            SELECT
                Document_FileData,
                Document_ContentType
            FROM tbl_Document
            WHERE Document_UserId = @WorkerId
              AND Document_Type = @DocumentType
            """;

        var photo = await connection.QuerySingleOrDefaultAsync<ProfilePhotoData>(
            photoSql,
            new
            {
                WorkerId = workerId,
                DocumentType = (short)DocumentType.Photo
            });


        // Get reviews
        const string reviewsSql = """
            SELECT
                Review_Id,
                Review_ReviewerId,
                Review_Rating,
                Review_Comment,
                Review_CreatedAt 
            FROM tbl_Review
            WHERE Review_RevieweeId = @WorkerId
            """;

        var reviews = (await connection.QueryAsync<ReviewDto>(
            reviewsSql,
            new { WorkerId = workerId }))
            .ToList();


        // Build the response
        return ("profile found", new GetWorkerProfileResp
        {
            UserId = user.User_Id,
            FullName = user.User_FullName,
            
            ProfilePhoto = photo?.Document_FileData,
            ProfilePhotoContentType = photo?.Document_ContentType,

            HourlyRate = workerProfile.WorkerProfile_HourlyRate,
            AboutMe = workerProfile.WorkerProfile_AboutMe,
            Skills = workerProfile.WorkerProfile_Skills,

            Professions = professions,
            Cities = cities,

            AverageRating = user.User_AvgRating,
            ReviewCount = user.User_ReviewCount,
            Reviews = reviews,

        });
    }


    public async Task<(string message, GetWorkerProfileResp? profile)> UpdateWorkerProfileAsync(
        int userId,
        UpdateWorkerProfileReq request)
    {

    
        await using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        await using var transaction = await connection.BeginTransactionAsync();


        try
        {
            //Search for worker 
            const string workerCheckSql = """
                SELECT COUNT(1)
                FROM tbl_User
                WHERE User_Id = @UserId
                AND User_Role = @WorkerRole;
                """;

            var workerExists = await connection.ExecuteScalarAsync<int>(
                workerCheckSql,
                new
                {
                    UserId = userId,
                    WorkerRole = (short)UserRole.Worker
                }, transaction);

            if (workerExists == 0) 
            {
                await transaction.RollbackAsync();
                return ("worker not found", null);
            }

            // Validate professions id send by the frontend to see if they exist in the database
            var professionIds = request.ProfessionIds
                .Distinct()
                .ToList();

            const string professionValidationSql = """
                SELECT COUNT(*)
                FROM tbl_Profession
                WHERE Profession_Id IN @ProfessionIds;
                """;

            var professionCount = await connection.ExecuteScalarAsync<int>(
                professionValidationSql,
                new { ProfessionIds = professionIds },
                transaction);

            if (professionCount != professionIds.Count)
            {
                await transaction.RollbackAsync();
                return ("One or more profession IDs are invalid", null);
            }

            // Update the worker profile
            const string updateProfileSql = """
                UPDATE tbl_WorkerProfile
                SET
                    WorkerProfile_HourlyRate = @HourlyRate,
                    WorkerProfile_AboutMe = @AboutMe,
                    WorkerProfile_Skills = @Skills
                WHERE WorkerProfile_UserId = @UserId;
                """;

            var profileUpdated = await connection.ExecuteAsync(
                updateProfileSql,
                new
                {
                    UserId = userId,
                    request.HourlyRate,
                    request.AboutMe,
                    request.Skills
                },
                transaction);

            if (profileUpdated == 0)
            {
                await transaction.RollbackAsync();
                return ("Failed to update worker profile", null);
            }


            // Remove existing professions
            const string deleteProfessionsSql = """
                DELETE FROM tbl_ProfessionWorker
                WHERE ProfessionWorker_WorkerId = @UserId;
                """;

            await connection.ExecuteAsync(
                deleteProfessionsSql,
                new { UserId = userId },
                transaction);


            //  Add selected professions
            const string insertProfessionSql = """
                INSERT INTO tbl_ProfessionWorker
                (
                    ProfessionWorker_WorkerId,
                    ProfessionWorker_ProfessionId
                )
                VALUES
                (
                    @UserId,
                    @ProfessionId
                );
                """;

            foreach (var professionId in request.ProfessionIds.Distinct())
            {
                await connection.ExecuteAsync(
                    insertProfessionSql,
                    new
                    {
                        UserId = userId,
                        ProfessionId = professionId
                    },
                    transaction);
            }

            // Validate cities id that exist in the db
            var cityIds = request.CityIds
                .Distinct()
                .ToList();

            const string cityValidationSql = """
                SELECT COUNT(*)
                FROM tbl_City
                WHERE City_Id IN @CityIds;
                """;

            var cityCount = await connection.ExecuteScalarAsync<int>(
                cityValidationSql,
                new { CityIds = cityIds },
                transaction);

            if (cityCount != cityIds.Count)
            {
                await transaction.RollbackAsync();
                return ("One or more city IDs are invalid", null);
            }
            //  Remove existing cities
            const string deleteCitiesSql = """
                DELETE FROM tbl_CityWorker
                WHERE CityWorker_WorkerId = @UserId;
                """;

            await connection.ExecuteAsync(
                deleteCitiesSql,
                new { UserId = userId },
                transaction);


            // Add selected cities
            const string insertCitySql = """
                INSERT INTO tbl_CityWorker
                (
                    CityWorker_WorkerId,
                    CityWorker_CityId
                )
                VALUES
                (
                    @UserId,
                    @CityId
                );
                """;

            foreach (var cityId in request.CityIds.Distinct())
            {
                await connection.ExecuteAsync(
                    insertCitySql,
                    new
                    {
                        UserId = userId,
                        CityId = cityId
                    },
                    transaction);
            }


            // Everything succeeded
            await transaction.CommitAsync();

            var result= await GetWorkerProfileAsync(userId);
            // Return the updated profile
            return ("Worker profile updated successfully", result.profile);
        }
        catch
        {
            await transaction.RollbackAsync();
            return("An error occurred while updating the worker profile", null);
        }
    }


}