namespace FreelanceApp.API.DTOs.WorkerProfile;

public class UpdateWorkerProfileReq
{
    public decimal HourlyRate { get; set; }

    public string? AboutMe { get; set; }

    public string? Skills { get; set; }

    public int ProfessionIds { get; set; } 

    public int CityIds { get; set; } 

    // public List<int> ProfessionIds { get; set; } = new();

    // public List<int> CityIds { get; set; } = new();

    // public IFormFile? ProfilePhoto { get; set; }
}