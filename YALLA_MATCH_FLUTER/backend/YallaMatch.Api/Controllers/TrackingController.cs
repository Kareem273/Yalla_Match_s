using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using YallaMatch.Api.Contracts;
using YallaMatch.Api.Data;
using YallaMatch.Api.Entities;

namespace YallaMatch.Api.Controllers;

[ApiController]
[Route("api/tracking")]
public sealed class TrackingController(YallaMatchDbContext db) : ControllerBase
{
    [HttpGet("{trackingCode}")]
    [EnableRateLimiting("tracking")]
    public async Task<IActionResult> TrackReservation(string trackingCode)
    {
        var reservation = await db.Reservations
            .Include(r => r.Court)
            .FirstOrDefaultAsync(r => r.TrackingCode == trackingCode);

        return reservation is null ? NotFound() : Ok(CustomerReservationDto.From(reservation));
    }

    [HttpPost("{trackingCode}/refund")]
    [EnableRateLimiting("tracking")]
    public async Task<IActionResult> RequestRefund(string trackingCode, ProcessRefundRequest request)
    {
        var reservation = await db.Reservations
            .Include(r => r.Court)
            .Include(r => r.PaymentConfirmation)
            .Include(r => r.Refund)
            .FirstOrDefaultAsync(r => r.TrackingCode == trackingCode);

        if (reservation is null) return NotFound();
        if (reservation.Refund is not null) return Conflict("This reservation has already been refunded.");
        if (reservation.PaymentStatus == PaymentStatus.RefundRequested) return Conflict("طلب الريفاند تم إرساله سابقاً وهو قيد المراجعة.");
        if (reservation.Status != ReservationStatus.Confirmed || reservation.PaymentStatus != PaymentStatus.Approved)
            return Conflict("Only confirmed, paid reservations can be refunded.");
        if (!HasRefundWindow(reservation))
            return Conflict("وقت الريفاند اتمنع. لا يمكن طلب ريفاند قبل أقل من 48 ساعة من الحجز.");
        if (!HasNotStarted(reservation))
            return Conflict("A refund can only be recorded before the reservation start time.");

        reservation.PaymentStatus = PaymentStatus.RefundRequested;
        reservation.RejectionReason = string.IsNullOrWhiteSpace(request.Reason) ? "Refund requested by customer." : request.Reason.Trim();
        if (reservation.PaymentConfirmation is not null)
        {
            reservation.PaymentConfirmation.Status = PaymentStatus.RefundRequested;
            reservation.PaymentConfirmation.RejectionReason = reservation.RejectionReason;
        }

        await db.SaveChangesAsync();
        return Ok(CustomerReservationDto.From(reservation));
    }

    private static bool HasRefundWindow(Reservation reservation)
    {
        if (!DateOnly.TryParseExact(reservation.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return false;

        var start = date.ToDateTime(new TimeOnly(Math.Clamp(reservation.FromHour, 0, 23), 0));
        return start > CairoNow().AddHours(48);
    }

    private static bool HasNotStarted(Reservation reservation)
    {
        if (!DateOnly.TryParseExact(reservation.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return false;

        var start = date.ToDateTime(new TimeOnly(Math.Clamp(reservation.FromHour, 0, 23), 0));
        return start > CairoNow().DateTime;
    }

    private static DateTimeOffset CairoNow()
    {
        try
        {
            return TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"));
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Africa/Cairo"));
        }
    }
}
