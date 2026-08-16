namespace FreelanceApp.API.DTOs.WorkerProfile
{   
    public class ProfilePhotoData
    {
        public byte[] Document_FileData { get; set; } = Array.Empty<byte>();
        public string? Document_ContentType { get; set; }
    }
}