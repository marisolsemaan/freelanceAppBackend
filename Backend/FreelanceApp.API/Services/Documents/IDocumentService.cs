using FreelanceApp.API.Enums;
using FreelanceApp.API.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;

namespace FreelanceApp.API.Services.Documents;

public interface IDocumentService
{
    // Saves an uploaded document for a specific user.
    Task<string > SaveDocumentAsync(IFormFile file, int userId,DocumentType documentType, SqlConnection connection, SqlTransaction transaction);
}