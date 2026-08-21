using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.Lookup;

namespace FreelanceApp.API.Services.Lookup;

public interface ILookupService
{
    Task<ApiResponse <IEnumerable<ProfessionResp> > > GetProfessionsAsync();

    Task<ApiResponse < IEnumerable<CityResp> > > GetCitiesAsync();
}