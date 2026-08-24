using FreelanceApp.API.DTOs;
using FreelanceApp.API.DTOs.HireOffer;

namespace FreelanceApp.API.Services.HireOffer;

public interface IHireOfferService
{
    Task<ApiResponse<HireOfferResp>> CreateHireOfferAsync( int clientId,int conversationId, HireOfferReq request);

    Task<ApiResponse<HireOfferResp>> UpdateOfferStatusAsync(  int workerId, int hireOfferId, UpdateHireOfferStatusReq request);
}