using FreelanceApp.API.DTOs.Rating;
namespace FreelanceApp.API.DTOs.ClientProfile;

public class ClientProfileResp
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public decimal AverageRating { get; set; }

    public int ReviewCount { get; set; }

    public IEnumerable<ReviewResp> Reviews { get; set; }= new List<ReviewResp>();
}