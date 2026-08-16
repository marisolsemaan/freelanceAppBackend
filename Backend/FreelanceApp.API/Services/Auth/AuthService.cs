using Dapper;
using FreelanceApp.API.Data;
using FreelanceApp.API.Enums;
using FreelanceApp.API.Helpers;
using FreelanceApp.API.Models.Auth;
using System.Data;
using FreelanceApp.API.DTOs.Auth;
using FreelanceApp.API.Services.Documents;
using Microsoft.Data.SqlClient;

namespace FreelanceApp.API.Services.Auth;

public class AuthService: IAuthService
{
    private readonly DbConnectionFactory _db;
    private readonly IConfiguration    _config;
    private readonly IDocumentService _documentService;

    public AuthService( DbConnectionFactory db, IConfiguration config, IDocumentService ds)
    {
        _db = db;
        _config = config;
        _documentService=ds;
    }

    public async Task<(string Message, AuthResponse? Response)>RegisterAsync(RegisterRequest request,IFormFile idFile, IFormFile photoFile, IFormFile? professionProofFile)
    {
        if (request.Role != (short)UserRole.Client && request.Role != (short)UserRole.Worker) // prevent admin registration
        {
            return ("Invalid role",null);
        }

        await using SqlConnection connection = _db.CreateConnection();
        await connection.OpenAsync();//open sql connection
        using SqlTransaction transaction= connection.BeginTransaction();//start transaction

        try 
        { 
            const string ExistEmail=""" Select Count(1) From tbl_User Where User_Email= @Email;  """; // check if email exist 
            
            var existEmail=await connection.ExecuteScalarAsync<int>(ExistEmail, new {Email=request.Email},transaction);

            if(existEmail>0)
            {
                await transaction.RollbackAsync();
                return("email already exist", null);
            }

            var passHash=BCrypt.Net.BCrypt.HashPassword(request.Password); // hash pass on the db

            // await using var transaction= await connection.BeginTransactionAsync(); // use a transaction for the tables
            const string insertUserSql="""

                Insert into tbl_User(
                    User_FullName,
                    User_Email,
                    User_Phone,
                    User_HashedPassword,
                    User_Role
                )
                Output Inserted.User_Id
                Values(
                    @FullName,
                    @Email,
                    @Phone,
                    @PasswordHash,
                    @Role
                );
                """;
                // sql will return the id of the new row
            var userId=await connection.ExecuteScalarAsync<int>(insertUserSql,new {

                FullName=request.FullName.Trim(),
                Email=request.Email.Trim(),
                Phone=request.Phone?.Trim(),
                PasswordHash=passHash,
                Role=request.Role

            }, 
            transaction);
            //every user registered has only one verfication row
            const string insertVerificationSql= """ 
            Insert Into tbl_UserVerification
            (   
                UserVerification_UserId,
                UserVerification_Status
            
            )
            Values(
                @UserId,
                @status
            )
            """;

            await connection.ExecuteAsync(insertVerificationSql, new{
                UserId=userId,
                Status=(short)UserVerificationStatus.Pending
            }, transaction);

            var verificationStatus = (short)UserVerificationStatus.Pending;

            var idDoc=await _documentService.SaveDocumentAsync(idFile,userId,DocumentType.ID,connection,transaction);

            if(idDoc !="Document uploaded succes"){
                await transaction.RollbackAsync();
                return(idDoc,null);
            }

            var photo = await _documentService.SaveDocumentAsync(
            photoFile,
            userId,
            DocumentType.Photo,
            connection,
            transaction);

            if(photo !="Document uploaded succes"){
                await transaction.RollbackAsync();
                return(photo ,null);
            }

            // Worker must provide professional proof.
            if ((UserRole)request.Role == UserRole.Worker)
            {
                if (professionProofFile == null)
                {
                    await transaction.RollbackAsync();
                    return ("Workers must upload a diploma, certificate, or professional proof.",null);
                }

                var proof = await _documentService.SaveDocumentAsync(
                    professionProofFile,
                    userId,
                    DocumentType.ProfessionProof,
                    connection,
                    transaction);

                if (proof != "Document uploaded succes")
                {
                    await transaction.RollbackAsync();
                    return ( proof , null);
                }
            }

            await transaction.CommitAsync();// make the two transactions
            //create user object for jwthelper
            var user= new User{
                User_Id=userId,
                User_FullName=request.FullName.Trim(),
                User_Email=request.Email.Trim(),
                User_Phone=request.Phone?.Trim(),
                User_HashedPassword=passHash,
                User_Role=(UserRole)request.Role,
                User_CreatedAt=DateTime.UtcNow,
                User_AvgRating=0,
                User_ReviewCount=0
            };
            //generate token for users
            var token=JwtHelper.GenerateToken(user,_config["Jwt:Key"]!,_config["Jwt:Issuer"]!,_config["Jwt:Audience"]!,int.Parse(_config["Jwt:AccessTokenExpireMinutes"]!));
            var response=  new AuthResponse{
                UserId=user.User_Id,
                Token=token.token,
                FullName=user.User_FullName,
                Email=user.User_Email,
                Phone=user.User_Phone,
                Role=(short)user.User_Role,
                ExpiresAt=token.ExpiresAt,
                VerificationStatus = verificationStatus,
            };

            return ("success registration",response);
        }
        catch(Exception ex) {
            await transaction.RollbackAsync(); // undo transcation upon failure

            return($"failed registration: {ex.Message}",null);
        }
    }

    public async Task<(string Message, AuthResponse? Response)> LoginAsync(LoginRequest request)
    {
        await using var connection=  _db.CreateConnection();
        await connection.OpenAsync();

        const string usersql="""
            Select User_Id,
            User_FullName,
            User_Email,
            User_Phone,
            User_HashedPassword,
            User_Role,
            User_CreatedAt,
            User_AvgRating,
            User_ReviewCount,
            UserVerification_Status
            FROM tbl_User Inner Join tbl_UserVerification on UserVerification_UserId=User_Id
            WHERE User_Email=@Email; 
            """;
        var user = await connection.QuerySingleOrDefaultAsync<User>(usersql, new {Email= request.Email});//find user
        if(user==null)
        {
            return ("invalid email ", null);
        }

        var passValid=BCrypt.Net.BCrypt.Verify(request.Password, user.User_HashedPassword);//compare the entered pass with the stored one

        if(!passValid){
            return("invalid pass", null);
        }

        var token = JwtHelper.GenerateToken(
            user,
            _config["Jwt:Key"]!,
            _config["Jwt:Issuer"]!,
            _config["Jwt:Audience"]!,
            int.Parse(_config["Jwt:AccessTokenExpireMinutes"]!)
        );

        var response=new AuthResponse{
            UserId=user.User_Id,
            Token=token.token,
            FullName=user.User_FullName,
            Email=user.User_Email,
            Phone=user.User_Phone,
            Role=(short)user.User_Role,
            ExpiresAt=token.ExpiresAt,
            VerificationStatus = user.VerificationStatus,
            
        };

        return("login success",response);

    }
}