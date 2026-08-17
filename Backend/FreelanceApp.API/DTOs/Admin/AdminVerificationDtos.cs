namespace FreelanceApp.API.DTOs.Admin;

public class AdminVerificationStatsDto
{
    public int Pending { get; set; } //0
    public int Approved { get; set; }//1
    public int Rejected { get; set; }//2
}

public class AdminPendingUserDto
{
    public int User_Id { get; set; }

    public string User_FullName { get; set; } = string.Empty;

    public string User_Email { get; set; } = string.Empty;

    public string? User_Phone { get; set; }

    public short User_Role { get; set; }

    public short UserVerification_Status { get; set; }

    public DateTime User_CreatedAt { get; set; }
}

public class AdminVerificationDetailsDto
{
    public int User_Id { get; set; }

    public string User_FullName { get; set; } = string.Empty;

    public string User_Email { get; set; } = string.Empty;

    public string? User_Phone { get; set; }

    public short User_Role { get; set; }

    public short UserVerification_Status { get; set; }

    public DateTime User_CreatedAt { get; set; }

    public List<AdminDocumentDto> Documents { get; set; } = new();
}

public class AdminDocumentDto
{
    public int Document_Id { get; set; }

    public short Document_Type { get; set; }

    public string Document_FileName { get; set; } = string.Empty;

    public string Document_ContentType { get; set; } = string.Empty;

    public DateTime Document_UploadedAt { get; set; }
}

public class AdminDocumentFileDto
{
    public int Document_Id { get; set; }

    public string Document_FileName { get; set; } = string.Empty;

    public string Document_ContentType { get; set; } = string.Empty;

    public byte[] Document_FileData { get; set; } = Array.Empty<byte>();
}