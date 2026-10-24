namespace YallaMatch.Api.Entities;

public sealed record ReservationDto(
    Guid Id,
    Guid CourtId,
    string? CourtName,
    string? CourtPaymentPhone,
    string CustomerSessionId,
    string? CustomerName,
    string? CustomerPhone,
    string Date,
    int FromHour,
    int ToHour,
    decimal Price,
    string Source,
    string Status,
    string PaymentStatus,
    string? QrToken,
    string? TrackingCode,
    string? PaymentScreenshotUrl,
    DateTimeOffset CreatedAtUtc,
    string? RejectionReason)
{
    public static ReservationDto From(Reservation reservation) => new(
        reservation.Id,
        reservation.CourtId,
        reservation.Court?.Name,
        reservation.Court?.PaymentPhone,
        reservation.CustomerSessionId,
        reservation.CustomerName,
        reservation.CustomerPhone,
        reservation.Date,
        reservation.FromHour,
        reservation.ToHour,
        reservation.Price,
        reservation.Source.ToString(),
        reservation.Status.ToString(),
        reservation.PaymentStatus.ToString(),
        reservation.QrToken,
        reservation.TrackingCode,
        reservation.PaymentConfirmation is null ? null : $"/api/admin/reservations/{reservation.Id}/payment-screenshot",
        reservation.CreatedAtUtc,
        reservation.RejectionReason);
}

public sealed record CustomerReservationDto(
    Guid Id,
    Guid CourtId,
    string? CourtName,
    string? CourtPaymentPhone,
    string? CustomerName,
    string? CustomerPhone,
    string Date,
    int FromHour,
    int ToHour,
    decimal Price,
    string Source,
    string Status,
    string PaymentStatus,
    string? QrToken,
    string? TrackingCode,
    bool PaymentScreenshotUploaded,
    DateTimeOffset CreatedAtUtc,
    string? RejectionReason)
{
    public static CustomerReservationDto From(Reservation reservation) => new(
        reservation.Id,
        reservation.CourtId,
        reservation.Court?.Name,
        reservation.Court?.PaymentPhone,
        reservation.CustomerName,
        reservation.CustomerPhone,
        reservation.Date,
        reservation.FromHour,
        reservation.ToHour,
        reservation.Price,
        reservation.Source.ToString(),
        reservation.Status.ToString(),
        reservation.PaymentStatus.ToString(),
        reservation.QrToken,
        reservation.TrackingCode,
        reservation.PaymentConfirmation is not null,
        reservation.CreatedAtUtc,
        reservation.RejectionReason);
}

public sealed record RefundDto(
    Guid Id,
    Guid ReservationId,
    string? CourtName,
    string? CustomerName,
    string? CustomerPhone,
    string Date,
    int FromHour,
    int ToHour,
    decimal Amount,
    string? Reason,
    DateTimeOffset RefundedAtUtc)
{
    public static RefundDto From(RefundRecord refund) => new(
        refund.Id,
        refund.ReservationId,
        refund.Reservation.Court?.Name,
        refund.Reservation.CustomerName,
        refund.Reservation.CustomerPhone,
        refund.Reservation.Date,
        refund.Reservation.FromHour,
        refund.Reservation.ToHour,
        refund.Amount,
        refund.Reason,
        refund.RefundedAtUtc);
}

public sealed record AuditLogDto(
    Guid Id,
    DateTimeOffset Timestamp,
    string AdminEmail,
    string AdminRole,
    string Action,
    string Details,
    string Category)
{
    public static AuditLogDto From(AuditLog log) => new(
        log.Id,
        log.Timestamp,
        log.AdminEmail,
        log.AdminRole,
        log.Action,
        log.Details,
        log.Category);
}
