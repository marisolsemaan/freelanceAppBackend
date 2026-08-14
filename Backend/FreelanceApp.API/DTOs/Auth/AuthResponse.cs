namespace FreelanceApp.API.DTOs.Auth;

public class AuthResponse
{
    public int UserId { get; set; }

    public string Token { get; set; } = "";

    public string FullName { get; set; } = "";

    public string Email { get; set; } = "";

    public string? Phone {get; set;}

    public short Role { get; set; }

    public DateTime ExpiresAt { get; set; }
}