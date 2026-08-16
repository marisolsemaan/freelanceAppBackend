namespace FreelanceApp.API.DTOs.Admin;

public class AdminVerificationStatsDto
{
    public int Pending { get; set; } //0
    public int Approved { get; set; }//1
    public int Rejected { get; set; }//2
}

public class AdminPendingUserDto
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public short Role { get; set; }

    public short VerificationStatus { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class AdminVerificationDetailsDto
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public short Role { get; set; }

    public short VerificationStatus { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<AdminDocumentDto> Documents { get; set; } = new();
}

public class AdminDocumentDto
{
    public int DocumentId { get; set; }

    public short DocumentType { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; }
}

public class AdminDocumentFileDto
{
    public int DocumentId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public byte[] FileData { get; set; } = Array.Empty<byte>();
}