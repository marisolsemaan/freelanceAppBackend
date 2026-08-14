using System.Text;//encoding
using FreelanceApp.API.Models.Auth;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;//jwt creation 

namespace FreelanceApp.API.Helpers;

public static class JwtHelper
{
    public static (string token, DateTime ExpiresAt) GenerateToken( User user, string Key, string issuer, string audience, int expiresMinutes)
    {
        var encryptedKey= new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key));//enncrypt the secret key from congig 

        var credentials= new SigningCredentials(encryptedKey,SecurityAlgorithms.HmacSha256);// define signing sha algo

        //the payload info about the authenticated user
        var claims= new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier,user.User_Id.ToString()), //convert the id of user to string and use it as a claim
            new Claim(ClaimTypes.Email,user.User_Email), 
            new Claim(ClaimTypes.Role,((short)user.User_Role).ToString()),
            new Claim(ClaimTypes.Name,user.User_FullName),
            new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())// give a special id to the token

        };

        var expiresAT=DateTime.UtcNow.AddMinutes(expiresMinutes);// know token expiration
        //create the token 
        var token=new JwtSecurityToken(issuer:issuer, audience:audience,claims:claims,expires:expiresAT,signingCredentials:credentials);

        var stringtoken=new JwtSecurityTokenHandler().WriteToken(token);// convert jwt object into string to be sent to frontend

        return (stringtoken, expiresAT); 
    }
}