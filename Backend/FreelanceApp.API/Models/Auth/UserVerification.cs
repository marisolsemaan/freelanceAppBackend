namespace FreelanceApp.API.Models.Auth;

public class UserVerification
{
    public int UserVerification_Id { get; set; }

    public int UserVerification_UserId { get; set; }

    public int? UserVerification_AdminId { get; set; }

    public short UserVerification_Status { get; set; }

    public DateTime? UserVerification_VerifiedAt { get; set; }
}