using FreelanceApp.API.DTOs.Rating;

namespace FreelanceApp.API.DTOs.WorkerProfile;

public class GetWorkerProfileResp
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public byte[]? ProfilePhoto { get; set; }

    public string? ProfilePhotoContentType { get; set; } //string or short as enum?

    public decimal HourlyRate { get; set; }

    public string? AboutMe { get; set; }

    public string? Skills { get; set; }

    public List<ProfessionDto> Professions { get; set; } = new();

    public List<CityDto> Cities { get; set; } = new();

    public decimal AverageRating { get; set; }

    public int ReviewCount { get; set; }

    public List<ReviewResp> Reviews { get; set; } = new();

}