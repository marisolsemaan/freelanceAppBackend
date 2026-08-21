using System.Text.RegularExpressions;

namespace FreelanceApp.API.Helpers;

public static class PhoneValidationHelper
{
    public static bool IsValidLebanesePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return true;
        }

        phone = phone
            .Replace(" ", "")
            .Replace("-", "")
            .Replace("(", "")
            .Replace(")", "");

        return Regex.IsMatch(
            phone,
            @"^(?:[3-9]\d{6}|0[3-9]\d{6}|\+961[3-9]\d{6})$"
        );
    }
}