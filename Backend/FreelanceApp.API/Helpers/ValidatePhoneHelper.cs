using System.Text.RegularExpressions;

namespace FreelanceApp.API.Helpers;

public static class PhoneValidationHelper
{
    public static bool IsValidLebanesePhone(string phone)
    {
        phone = phone.Replace(" ", "")
                     .Replace("-", "");

        return Regex.IsMatch(
            phone,
            @"^(?:0[3-9]\d{6}|\+961[3-9]\d{6})$"
        );
    }
}