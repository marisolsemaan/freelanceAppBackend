namespace FreelanceApp.API.Models.Auth;

public class Document
{
    public int Document_Id { get; set; }

    public int Document_UserId { get; set; }

    public short Document_Type { get; set; }

    public string Document_FileName { get; set; } = string.Empty;

    public string Document_ContentType { get; set; } = string.Empty;

    public byte[] Document_FileData { get; set; } = Array.Empty<byte>();

    public DateTime Document_UploadedAt { get; set; }
}