namespace FreelanceApp.API.Models.WorkerProfile;

public class WorkerProfile
{
    public int WorkerProfile_Id { get; set; }

    public int WorkerProfile_UserId { get; set; }

    public decimal WorkerProfile_HourlyRate { get; set; }

    public string? WorkerProfile_AboutMe { get; set; }

    public string? WorkerProfile_Skills { get; set; }
}