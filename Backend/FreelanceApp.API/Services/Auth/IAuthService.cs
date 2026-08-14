using FreelanceApp.API.DTOs.Auth;

namespace FreelanceApp.API.Services.Auth;

public interface IAuthService
{
    Task<(string Message, AuthResponse? Response)> RegisterAsync(RegisterRequest request, IFormFile idFile, IFormFile photoFile, IFormFile? professionProofProfile);//register user and give them token
    Task<(string Message, AuthResponse? Response)> LoginAsync(LoginRequest request);//log in user and give them credentials
}