namespace YallaMatch.Api.Entities;

public sealed class Admin
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public LoginAccount? LoginAccount { get; set; }
}
