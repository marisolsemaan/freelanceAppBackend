using System.ComponentModel.DataAnnotations;

namespace FreelanceApp.API.DTOs.Auth;

public class RegisterRequest
{
    [Required]
    public string FullName { get; set; } = "";

    [Required, EmailAddress]
    public string Email { get; set; } = "";

    public string? Phone { get; set; }

    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
    [Required]
    public string Password { get; set; } = "";

    [Required]
    public short Role { get; set; }
}