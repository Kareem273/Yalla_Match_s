namespace YallaMatch.Api.Entities;

public class AccountEntity
{
    public long Id { get; set; }
    public string NationalId { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public long RoleId { get; set; }
    public long StatusId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
