namespace FreelanceApp.API.Services.Verification;

public interface IUserVerificationService
{
    Task<bool> IsUserVerifiedAsync(int userId);
}