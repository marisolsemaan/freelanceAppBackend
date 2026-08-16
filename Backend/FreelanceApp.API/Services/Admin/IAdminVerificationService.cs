using FreelanceApp.API.DTOs.Admin;

namespace FreelanceApp.API.Services.Admin;

public interface IAdminVerificationService
{
    Task<AdminVerificationStatsDto> GetStatisticsAsync();

    Task<IEnumerable<AdminPendingUserDto>> GetPendingUsersAsync();

    Task<AdminVerificationDetailsDto?> GetUserVerificationAsync( int userId);

    Task<AdminDocumentFileDto?> GetDocumentAsync(int userId, int documentId);

    Task RejectUserAsync(int userId, int adminId);

    Task ApproveUserAsync(int userId,int adminId);


}