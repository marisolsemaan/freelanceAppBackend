using Microsoft.AspNetCore.Http;
namespace FreelanceApp.API.Helpers;
public static class FileValidationHelper
{
    public static string? ValidateDocument(IFormFile? file, string[] allowedExtensions)
    {
        if(file==null ||  file.Length==0)
        {
            return "empty file"; 

        }

        var extension=Path.GetExtension(file.FileName).ToLowerInvariant();// get the extention from the name of the file

        if(!allowedExtensions.Contains(extension)){
            return "invalid file types"; // check if the extention of the file is allowed

        }

        //basic verification to
        //allow the content type
        if(string.IsNullOrWhiteSpace(file.ContentType))
        {
            return "invalid file content type";
        }

        return null;
    }



}