using FreelanceApp.API.Enums;
using FreelanceApp.API.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FreelanceApp.API.Helpers;

namespace FreelanceApp.API.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/verifications")]
public class AdminVerificationController : ControllerBase
{
    private readonly IAdminVerificationService _service;

    public AdminVerificationController( IAdminVerificationService service)
    {
        _service = service;
    }

    //get the admin if from jwt token
    private bool TryGetCurrentUserId(out int userId)
    {
        userId = 0;

        var claim =User.FindFirst(ClaimTypes.NameIdentifier)?.Value?? User.FindFirst("sub")?.Value;

        return int.TryParse(claim, out userId);
    }

    //  Check admin role from jwt token
    private bool IsAdmin()
    {
        var role =
            User.FindFirst(ClaimTypes.Role)?.Value
            ?? User.FindFirst("role")?.Value;

        if (string.IsNullOrEmpty(role))
            return false;

        return role == "0"
            || role.Equals(
                UserRole.Admin.ToString(),
                StringComparison.OrdinalIgnoreCase);
    }

    // DASHBOARD STATISTICS
    [HttpGet("stats")]
    public async Task<IActionResult> GetStatistics()
    {
        if (!IsAdmin())
            return Forbid();

        var stats = await _service.GetStatisticsAsync();

        return Ok(stats);
    }

    // get pending users

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingUsers()
    {
        if (!IsAdmin())
            return Forbid();

        var users =
            await _service.GetPendingUsersAsync();

        return Ok(users);
    }

    // user details
    [HttpGet("{userId:int}")]
    public async Task<IActionResult> GetUserVerification(
        int userId)
    {
        if (!IsAdmin())
            return Forbid();

        var user =
            await _service.GetUserVerificationAsync(userId);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User verification request not found."
            });
        }

        return Ok(user);
    }

    // documents details

    [HttpGet("{userId:int}/documents/{documentId:int}")]
    public async Task<IActionResult> GetDocument(
        int userId,
        int documentId)
    {
        if (!IsAdmin())
            return Forbid();

        var document =
            await _service.GetDocumentAsync(
                userId,
                documentId);

        if (document == null)
        {
            return NotFound(new
            {
                message = "Document not found."
            });
        }

        return File(
            document.Document_FileData,
            document.Document_ContentType,
            document.Document_FileName);
    }

    [HttpPost("{userId:int}/approve")]
    public async Task<IActionResult> ApproveUser(
        int userId)
    {
        if (!IsAdmin())
            return Forbid();

        if (!TryGetCurrentUserId(out var adminId))
        {
            return Unauthorized(new
            {
                message = "Invalid admin identity."
            });
        }

        try
        {
            await _service.ApproveUserAsync(
                userId,
                adminId);

            return Ok(new
            {
                message = "User approved successfully.",
                userId
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("{userId:int}/reject")]
    public async Task<IActionResult> RejectUser(
        int userId)
    {
        if (!IsAdmin())
            return Forbid();

        if (!TryGetCurrentUserId(out var adminId))
        {
            return Unauthorized(new
            {
                message = "Invalid admin identity."
            });
        }

        try
        {
            await _service.RejectUserAsync(
                userId,
                adminId);

            return Ok(new
            {
                message = "User rejected successfully.",
                userId
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}