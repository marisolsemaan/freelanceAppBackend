using FreelanceApp.API.DTOs.Rating;
namespace FreelanceApp.API.DTOs.ClientProfile;

public class ClientProfileResp
{
    public int User_Id { get; set; }

    public string User_FullName { get; set; } = string.Empty;

    public decimal User_AvgRating { get; set; }

    public int User_ReviewCount { get; set; }

    public List<ReviewResp> Reviews { get; set; } = new();
}