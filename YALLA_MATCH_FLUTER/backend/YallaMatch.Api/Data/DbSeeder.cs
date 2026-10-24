using Microsoft.EntityFrameworkCore;
using YallaMatch.Api.Entities;
using YallaMatch.Api.Security;

namespace YallaMatch.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(YallaMatchDbContext db, bool seedDevelopmentAccounts)
    {
        // Production accounts are provisioned outside of the application. Never create
        // predictable default credentials outside development.
        if (!seedDevelopmentAccounts) return;

        // 1. Seed SuperAdmin Account
        var superAdmin = await db.Admins.FirstOrDefaultAsync(a => a.Email == "superadmin@yallamatch.local");
        if (superAdmin is null)
        {
            superAdmin = new Admin { Email = "superadmin@yallamatch.local" };
            db.Admins.Add(superAdmin);
        }
        var superAdminPasswordHash = Passwords.Hash("Admin@12345");
        var superAdminLogin = await db.LoginAccounts.FirstOrDefaultAsync(a => a.Email == superAdmin.Email);
        if (superAdminLogin is null)
        {
            db.LoginAccounts.Add(new LoginAccount
            {
                SubjectId = superAdmin.Id,
                Email = superAdmin.Email,
                PasswordHash = superAdminPasswordHash,
                Role = UserRole.SuperAdmin
            });
        }
        else
        {
            superAdminLogin.SubjectId = superAdmin.Id;
            superAdminLogin.PasswordHash = superAdminPasswordHash;
            superAdminLogin.Role = UserRole.SuperAdmin;
            superAdminLogin.IsActive = true;
        }

        // 2. Seed Regular Admin Account
        var admin = await db.Admins.FirstOrDefaultAsync(a => a.Email == "admin@yallamatch.local");
        if (admin is null)
        {
            admin = new Admin { Email = "admin@yallamatch.local" };
            db.Admins.Add(admin);
        }
        var adminPasswordHash = Passwords.Hash("Admin@12345");
        var adminLogin = await db.LoginAccounts.FirstOrDefaultAsync(a => a.Email == admin.Email);
        if (adminLogin is null)
        {
            db.LoginAccounts.Add(new LoginAccount
            {
                SubjectId = admin.Id,
                Email = admin.Email,
                PasswordHash = adminPasswordHash,
                Role = UserRole.Admin
            });
        }
        else
        {
            adminLogin.SubjectId = admin.Id;
            adminLogin.PasswordHash = adminPasswordHash;
            adminLogin.Role = UserRole.Admin;
            adminLogin.IsActive = true;
        }

        await db.SaveChangesAsync();
    }
}
