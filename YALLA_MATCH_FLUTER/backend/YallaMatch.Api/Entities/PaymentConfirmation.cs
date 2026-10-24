namespace YallaMatch.Api.Entities;

public sealed class PaymentConfirmation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;
    public string ScreenshotPath { get; set; } = "";
    public PaymentStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset UploadedAtUtc { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ReviewedAtUtc { get; set; }
}
