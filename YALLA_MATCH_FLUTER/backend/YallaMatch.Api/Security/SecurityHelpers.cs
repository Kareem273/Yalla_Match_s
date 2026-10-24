using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using YallaMatch.Api.Entities;

namespace YallaMatch.Api.Security;

public static class Passwords
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 210_000;

    public static string Hash(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(value, salt, Iterations, HashAlgorithmName.SHA512, KeySize);
        return $"PBKDF2-SHA512${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
    }

    public static bool Verify(string value, string storedHash)
    {
        if (string.IsNullOrEmpty(value) || string.IsNullOrEmpty(storedHash)) return false;

        if (storedHash.StartsWith("PBKDF2-SHA512$", StringComparison.Ordinal))
        {
            var parts = storedHash.Split('$');
            if (parts.Length != 4 || !int.TryParse(parts[1], out var iterations)) return false;

            try
            {
                var salt = Convert.FromBase64String(parts[2]);
                var expected = Convert.FromBase64String(parts[3]);
                var actual = Rfc2898DeriveBytes.Pbkdf2(value, salt, iterations, HashAlgorithmName.SHA512, expected.Length);
                return CryptographicOperations.FixedTimeEquals(actual, expected);
            }
            catch (FormatException)
            {
                return false;
            }
        }

        // Existing installations used unsalted SHA-256. Keep this only long enough
        // to transparently upgrade a valid login to PBKDF2 in AuthController.
        var legacy = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(Convert.ToHexString(legacy)),
            Encoding.UTF8.GetBytes(storedHash));
    }

    public static bool NeedsRehash(string storedHash) =>
        !storedHash.StartsWith("PBKDF2-SHA512$", StringComparison.Ordinal);
}

public static class Codes
{
    public static string NewQrToken(Guid reservationId) => $"YM:{reservationId:N}:{Guid.NewGuid():N}";
    // The existing database column is nvarchar(40). 18 secure random bytes
    // encode to 36 hexadecimal characters; together with "YM-" this is 39
    // characters while still providing 144 bits of entropy.
    public static string NewTrackingCode() => $"YM-{Convert.ToHexString(RandomNumberGenerator.GetBytes(18))}";
}

public static class CustomerSessions
{
    public const string HeaderName = "X-Customer-Session";
    private const int MinimumLength = 32;

    public static bool TryGetHash(HttpRequest request, out string hash)
    {
        var session = request.Headers[HeaderName].FirstOrDefault()?.Trim();
        if (string.IsNullOrWhiteSpace(session) || session.Length < MinimumLength || session.Length > 512)
        {
            hash = string.Empty;
            return false;
        }

        hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(session)));
        return true;
    }

    public static bool Matches(string storedHash, string requestHash) =>
        !string.IsNullOrWhiteSpace(storedHash) &&
        CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(storedHash),
            Encoding.UTF8.GetBytes(requestHash));
}

public static class Tokens
{
    public static string Create(string id, string email, UserRole role, IConfiguration config)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, id),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role.ToString())
        };

        var keyValue = config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(keyValue) || keyValue.Length < 32)
            throw new InvalidOperationException("JWT signing key is missing or too short.");

        var lifetimeMinutes = Math.Clamp(config.GetValue<int?>("Jwt:AdminTokenLifetimeMinutes") ?? 60, 15, 120);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(lifetimeMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
