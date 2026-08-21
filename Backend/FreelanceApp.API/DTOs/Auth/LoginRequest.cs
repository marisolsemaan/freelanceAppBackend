using System.ComponentModel.DataAnnotations;

namespace FreelanceApp.API.DTOs.Auth;

public class LoginRequest
{
    [Required]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}