using FreelanceApp.API.DTOs.WorkerProfile;
namespace FreelanceApp.API.Services.WorkerProfile;

public interface IWorkerProfileService
{
    Task<GetWorkerProfileResp?> GetWorkerProfileAsync(int workerId);

    Task<GetWorkerProfileResp?> UpdateWorkerProfileAsync(
        int userId,
        UpdateWorkerProfileReq r);
}