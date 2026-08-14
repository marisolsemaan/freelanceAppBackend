using Dapper;
using FreelanceApp.API.Data;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Helpers;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.AspNetCore.Http;

namespace FreelanceApp.API.Services.Documents;

public class DocumentService: IDocumentService
{
    private readonly DbConnectionFactory _db;

    public DocumentService(DbConnectionFactory db)
    {
        _db=db;
    }

    public async Task<string> SaveDocumentAsync(IFormFile file, int userId, DocumentType documentType, SqlConnection connection, SqlTransaction transaction)
    {
        // Decide which file types are allowed depending
        // on the type of document being uploaded.
        string[] allowedExtensions;

        switch (documentType)
        {
            case DocumentType.Photo:

                // Profile photos are images only.
                allowedExtensions = new[]
                {
                    ".jpg",
                    ".jpeg",
                    ".png"
                };

                break;


            case DocumentType.ID:

                // ID can be an image or PDF.
                allowedExtensions = new[]
                {
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".pdf"
                };

                break;


            case DocumentType.ProfessionProof:

                // Degree/certificate can be an image or PDF.
                allowedExtensions = new[]
                {
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".pdf"
                };

                break;


            default:

                return "Invalid document type.";
        }

        string? invalidFile=FileValidationHelper.ValidateDocument(file,allowedExtensions);//validate file before storing it
        if(invalidFile != null){ // invalid file
            return invalidFile;
        }

        using var memoryStream= new MemoryStream();// convert the file into bytes for storage
        await file.CopyToAsync(memoryStream);// store the memorystream into memory
        var fileData= memoryStream.ToArray(); // convert it to array

        // using var connection = _db.CreateConnection();
        // connection.Open();//open sql connection

        // if (connection==null)
        // {
        //     return "could not create sql connection";
        // }

        // await connection.OpenAsync();

        const string documentsql="""
            Insert Into tbl_Document(
                Document_UserId,
                Document_Type,
                Document_FileName,
                Document_ContentType,
                Document_FileData
            
            )
            VALUES
            (
                @UserId,
                @DocumentType,
                @FileName,
                @ContentType,
                @FileData
            );
            """;

            //execute the insert query using the same connection and transaction used by registration
        await connection.ExecuteAsync(documentsql, new {
            UserId=userId,
            DocumentType=(short)documentType, //sql column is smallint so cast enum to short
            FileName=Path.GetFileName(file.FileName),//extract file name and extention only
            ContentType=file.ContentType,
            FileData=fileData // file bytes stored in varBinary
        }, transaction);

        return("Document uploaded succes");

    }
}