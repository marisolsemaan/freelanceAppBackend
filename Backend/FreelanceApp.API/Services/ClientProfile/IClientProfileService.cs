using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.ClientProfile;

namespace FreelanceApp.API.Services.ClientProfile;

public interface IClientProfileService
{
    Task<ApiResponse<ClientProfileResp>> GetClientProfileAsync(int clientId);
}