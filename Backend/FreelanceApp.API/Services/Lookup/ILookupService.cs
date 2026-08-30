using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Lookup;
using FreelanceApp.API.DTOs.WorkerProfile;

namespace FreelanceApp.API.Services.Lookup;

public interface ILookupService
{
    Task<ApiResponse <IEnumerable<ProfessionResp> > > GetProfessionsAsync();

    Task<ApiResponse < IEnumerable<CityResp> > > GetCitiesAsync();

    Task<ApiResponse<ProfessionResp>> CreateProfessionAsync(CreateProfessionReq request, int workerId);
}