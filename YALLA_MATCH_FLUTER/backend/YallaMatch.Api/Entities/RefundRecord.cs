namespace YallaMatch.Api.Entities;

public sealed class RefundRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;
    public decimal Amount { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset RefundedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}
