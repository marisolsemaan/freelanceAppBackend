using FreelanceApp.API.DTOs.WorkerProfile;
namespace FreelanceApp.API.Services.WorkerProfile;

public interface IWorkerProfileService
{
    Task<(string message, GetWorkerProfileResp? profile)> GetWorkerProfileAsync(int workerId);

    Task<(string message, GetWorkerProfileResp? profile)> UpdateWorkerProfileAsync(int userId, UpdateWorkerProfileReq r);
}