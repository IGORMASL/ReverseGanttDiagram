using GanttChartAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace GanttChartAPI.Instruments
{
    public static class PasswordHasher
    {
        private static readonly PasswordHasher<User> _hasher = new();

        public static string Hash(string password)
        {
            return _hasher.HashPassword(null, password);
        }

        public static bool Verify(string hash, string password)
        {
            var result = _hasher.VerifyHashedPassword(null, hash, password);
            return result == PasswordVerificationResult.Success;
        }
    }
}
