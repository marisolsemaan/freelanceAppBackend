using FreelanceApp.API.Enums;

namespace FreelanceApp.API.DTOs.HireOffer;

public class UpdateHireOfferStatusReq
{
    public HireOfferStatus Status { get; set; }
}