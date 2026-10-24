namespace YallaMatch.Api.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    public string AdminEmail { get; set; } = "system";
    public string AdminRole { get; set; } = "Admin";
    public string Action { get; set; } = "";
    public string Details { get; set; } = "";
    public string Category { get; set; } = "General";
}
