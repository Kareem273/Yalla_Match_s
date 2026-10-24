using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YallaMatch.Api.Contracts;
using YallaMatch.Api.Data;
using YallaMatch.Api.Entities;
using YallaMatch.Api.Security;

namespace YallaMatch.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(YallaMatchDbContext db, IConfiguration config, ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("admin/login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> AdminLogin(LoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request?.Email) || string.IsNullOrWhiteSpace(request?.Password))
            {
                return BadRequest(new { message = "البريد الإلكتروني وكلمة المرور مطلوبة." });
            }

            var email = request.Email.Trim().ToLowerInvariant();
            var account = await db.LoginAccounts.FirstOrDefaultAsync(a =>
                a.Email.ToLower() == email &&
                (a.Role == UserRole.Admin || a.Role == UserRole.SuperAdmin) &&
                a.IsActive);

            if (account is null || !Passwords.Verify(request.Password, account.PasswordHash))
            {
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
            }

            if (Passwords.NeedsRehash(account.PasswordHash))
            {
                account.PasswordHash = Passwords.Hash(request.Password);
            }

            var token = Tokens.Create(account.SubjectId.ToString(), account.Email, account.Role, config);

            db.AuditLogs.Add(new AuditLog
            {
                AdminEmail = account.Email,
                AdminRole = account.Role.ToString(),
                Action = "تسجيل دخول موظف (Staff Login)",
                Details = $"قام الموظف/المدير {account.Email} بتسجيل الدخول إلى النظام",
                Category = "Auth",
                Timestamp = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();

            return Ok(new {
                id = account.SubjectId,
                email = account.Email,
                role = account.Role.ToString(),
                token = token
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Admin login failed for {Email}", request?.Email);
            return StatusCode(500, new { message = "حدث خطأ داخلي. حاول مرة أخرى لاحقاً." });
        }
    }
}
