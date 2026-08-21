using FreelanceApp.API.DTOs.Auth;
using FreelanceApp.API.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceApp.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    // Inject the authentication service.
    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    // registration contains files, the request uses
    // multipart/form-data 
    [HttpPost("register")]
    public async Task<IActionResult> Register( [FromForm] RegisterRequest request, IFormFile idFile, IFormFile photoFile,  IFormFile? professionProofFile)
    {
        // Call the authentication service.
        var result = await _auth.RegisterAsync(
            request,
            idFile,
            photoFile,
            professionProofFile);

        // Registration failed because of INVALID input.
        if (result.Message != "success registration")
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        // Registration succeeded.
        return Ok(new
        {
            Message = result.Message,
            Response = result.Response
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login( [FromBody] LoginRequest request)
    {
        // Call authentication service.
        var result = await _auth.LoginAsync(request);

        // Invalid email/password.
        if (result.Message !="login success")
        {
            return Unauthorized(new
            {
                Message = result.Message
            });
        }

        // Login successful.
        return Ok(new
        {
            Message = result.Message,
            Response = result.Response
        });
    }
}