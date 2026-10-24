namespace YallaMatch.Api.Entities;

public sealed class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourtId { get; set; }
    public Court Court { get; set; } = null!;
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerSessionId { get; set; } = "";
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string Date { get; set; } = "";
    public int FromHour { get; set; }
    public int ToHour { get; set; }
    public decimal Price { get; set; }
    public BookingSource Source { get; set; } = BookingSource.Online;
    public ReservationStatus Status { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? QrToken { get; set; }
    public string? TrackingCode { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CheckedInAtUtc { get; set; }
    public PaymentConfirmation? PaymentConfirmation { get; set; }
    public RefundRecord? Refund { get; set; }
}
