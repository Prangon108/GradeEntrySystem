using System.Security.Cryptography;
using System.Text;

namespace GradeEntrySystem.Server.Services;

/// <summary>
/// Simple SHA256-based password hashing utility for demo purposes.
/// Note: In production, use a strong password hasher with salt (e.g., ASP.NET Identity PBKDF2/Argon2).
/// </summary>
public class PasswordHasher
{
    public static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    public static bool VerifyPassword(string password, string passwordHash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == passwordHash;
    }
}
