using FreelanceApp.API.Enums;

namespace FreelanceApp.API.Models.Auth;

public class User
{
    public int User_Id { get; set; }

    public string User_FullName { get; set; } = string.Empty;

    public string User_Email { get; set; } = string.Empty;

    public string? User_Phone { get; set; }

    public string User_HashedPassword { get; set; } = string.Empty;

    public UserRole User_Role { get; set; }

    public DateTime User_CreatedAt { get; set; }

    public decimal User_AvgRating { get; set; }

    public int User_ReviewCount { get; set; }

    public short UserVerification_Status { get; set; }
}