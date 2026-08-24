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

        // Strip everything except digits (removes spaces, +, -, (, ), etc.)
        string cleanPhone = Regex.Replace(phone, @"\D", "");

        // Accepts 7 to 8 digits locally (e.g., 3xxxxxx or 81xxxxxx)
        // or 10 to 11 digits with country code 961 (e.g., 9613xxxxxx or 96181xxxxxx)
        return Regex.IsMatch(cleanPhone, @"^(?:961)?(?:0?[1-9]\d{6,7})$");
    }
}