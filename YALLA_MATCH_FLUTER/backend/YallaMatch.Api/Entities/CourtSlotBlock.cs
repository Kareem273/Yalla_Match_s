namespace YallaMatch.Api.Entities;

public sealed class CourtSlotBlock
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourtId { get; set; }
    public Court Court { get; set; } = null!;
    public string Date { get; set; } = "";
    public int FromHour { get; set; }
    public int ToHour { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}
