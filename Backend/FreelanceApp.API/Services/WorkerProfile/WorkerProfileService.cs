using Dapper;
using FreelanceApp.API.Data;
using FreelanceApp.API.DTOs.Rating;
using FreelanceApp.API.DTOs.WorkerProfile;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Models.Auth;
using WorkerProfileModel = FreelanceApp.API.Models.WorkerProfile.WorkerProfile;

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
        await connection.OpenAsync();

       //find worker
        const string userSql = """
            SELECT
                User_Id,
                User_FullName,
                ISNULL(User_AvgRating, 0) AS User_AvgRating,
                ISNULL(User_ReviewCount, 0) AS User_ReviewCount
            FROM tbl_User
            WHERE User_Id = @WorkerId
              AND User_Role = @Role;
            """;

        var user = await connection.QuerySingleOrDefaultAsync<User>(
            userSql,
            new
            {
                WorkerId = workerId,
                Role = (short)UserRole.Worker
            });

        if (user is null) {
            return ("Worker not found", null);
        }

        //worker profile
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
        {
            return ("Worker profile not found", null);
        }
        
        const string professionSql = """
            SELECT
                Profession_Id,
                Profession_Title
            FROM tbl_ProfessionWorker 
            INNER JOIN tbl_Profession 
                ON Profession_Id = ProfessionWorker_ProfessionId
            WHERE ProfessionWorker_WorkerId = @WorkerId;
            """;

        var professions =
            (await connection.QueryAsync<ProfessionDto>(
                professionSql,
                new { WorkerId = workerId }))
            .ToList();

        //city query
        const string citySql = """
            SELECT
                City_Id,
                City_Name
            FROM tbl_CityWorker 
            INNER JOIN tbl_City 
                ON City_Id = CityWorker_CityId
            WHERE CityWorker_WorkerId = @WorkerId;
            """;

        var cities =
            (await connection.QueryAsync<CityDto>(
                citySql,
                new { WorkerId = workerId }))
            .ToList();

        // retrieve photo from the dbase
        const string photoSql = """
            SELECT
                Document_FileData,
                Document_ContentType
            FROM tbl_Document
            WHERE Document_UserId = @WorkerId
              AND Document_Type = @DocumentType;
            """;

        var photo =
            await connection.QuerySingleOrDefaultAsync<ProfilePhotoData>(
                photoSql,
                new
                {
                    WorkerId = workerId,
                    DocumentType = (short)DocumentType.Photo
                });
        
        //retrieve the reviews left for this user worker
        const string reviewsSql = """
            SELECT
                Review_Id,
                Review_ReviewerId,
                User_FullName AS ReviewerFullName,
                Review_Rating,
                Review_Comment,
                Review_CreatedAt
            FROM tbl_Review 
            INNER JOIN tbl_User 
                ON User_Id = Review_ReviewerId
            WHERE Review_RevieweeId = @WorkerId
            ORDER BY Review_CreatedAt DESC;
            """;

        var reviews =
            (await connection.QueryAsync<ReviewResp>(
                reviewsSql,
                new { WorkerId = workerId }))
            .ToList();

        return (
            "Profile found",
            new GetWorkerProfileResp
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

                Reviews = reviews
            }
        );
    }


    public async Task<(string message, GetWorkerProfileResp? profile)> UpdateWorkerProfileAsync(int userId, UpdateWorkerProfileReq request)
    {
        await using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        await using var transaction =
            await connection.BeginTransactionAsync();

        try
        {
           //worker is in the table found
            const string workerCheckSql = """
                SELECT COUNT(1)
                FROM tbl_User
                WHERE User_Id = @UserId
                  AND User_Role = @WorkerRole;
                """;

            var workerExists =
                await connection.ExecuteScalarAsync<int>(
                    workerCheckSql,
                    new
                    {
                        UserId = userId,
                        WorkerRole = (short)UserRole.Worker
                    },
                    transaction);

            if (workerExists == 0)
            {
                await transaction.RollbackAsync();
                return ("Worker not found", null);
            }

            //check for valiid profession
            const string professionCheckSql = """
                SELECT COUNT(1)
                FROM tbl_Profession
                WHERE Profession_Id = @ProfessionId;
                """;

            var professionExists =
                await connection.ExecuteScalarAsync<int>(
                    professionCheckSql,
                    new
                    {
                        ProfessionId = request.ProfessionId
                    },
                    transaction);

            if (professionExists == 0)
            {
                await transaction.RollbackAsync();

                return (
                    "Selected profession does not exist.",
                    null
                );
            }

            //check for city existence
            const string cityCheckSql = """
                SELECT COUNT(1)
                FROM tbl_City
                WHERE City_Id = @CityId;
                """;

            var cityExists =
                await connection.ExecuteScalarAsync<int>(
                    cityCheckSql,
                    new
                    {
                        CityId = request.CityId
                    },
                    transaction);

            if (cityExists == 0)
            {
                await transaction.RollbackAsync();

                return (
                    "Selected city does not exist.",
                    null
                );
            }

            //if profile created before modify row, if not create a new profile row for this worker
            const string profileCheckSql = """
                SELECT COUNT(1)
                FROM tbl_WorkerProfile
                WHERE WorkerProfile_UserId = @UserId;
                """;

            var profileExists =
                await connection.ExecuteScalarAsync<int>(
                    profileCheckSql,
                    new { UserId = userId },
                    transaction);

            if (profileExists > 0)
            {
                const string updateProfileSql = """
                    UPDATE tbl_WorkerProfile
                    SET
                        WorkerProfile_HourlyRate = @HourlyRate,
                        WorkerProfile_AboutMe = @AboutMe,
                        WorkerProfile_Skills = @Skills
                    WHERE WorkerProfile_UserId = @UserId;
                    """;

                await connection.ExecuteAsync(
                    updateProfileSql,
                    new
                    {
                        UserId = userId,
                        request.HourlyRate,
                        request.AboutMe,
                        request.Skills
                    },
                    transaction);
            }
            else
            {
                const string insertProfileSql = """
                    INSERT INTO tbl_WorkerProfile
                    (
                        WorkerProfile_UserId,
                        WorkerProfile_HourlyRate,
                        WorkerProfile_AboutMe,
                        WorkerProfile_Skills
                    )
                    VALUES
                    (
                        @UserId,
                        @HourlyRate,
                        @AboutMe,
                        @Skills
                    );
                    """;

                await connection.ExecuteAsync(
                    insertProfileSql,
                    new
                    {
                        UserId = userId,
                        request.HourlyRate,
                        request.AboutMe,
                        request.Skills
                    },
                    transaction);
            }

           //replace profession when user edit and change it
            const string deleteProfessionSql = """
                DELETE FROM tbl_ProfessionWorker
                WHERE ProfessionWorker_WorkerId = @UserId;
                """;

            await connection.ExecuteAsync(
                deleteProfessionSql,
                new { UserId = userId },
                transaction);

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

            await connection.ExecuteAsync(
                insertProfessionSql,
                new
                {
                    UserId = userId,
                    ProfessionId = request.ProfessionId
                },
                transaction);

            //same for city replace value depending on user/worker change
            const string deleteCitySql = """
                DELETE FROM tbl_CityWorker
                WHERE CityWorker_WorkerId = @UserId;
                """;

            await connection.ExecuteAsync(
                deleteCitySql,
                new { UserId = userId },
                transaction);

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

            await connection.ExecuteAsync(
                insertCitySql,
                new
                {
                    UserId = userId,
                    CityId = request.CityId
                },
                transaction);

            //apply changes
            await transaction.CommitAsync();

            // Get fresh profile after commit
            var result = await GetWorkerProfileAsync(userId);

            return (
                "Worker profile updated successfully",
                result.profile
            );
        }
        catch
        {
            await transaction.RollbackAsync();

            return (
                "An error occurred while updating the worker profile.",
                null
            );
        }
    }
}