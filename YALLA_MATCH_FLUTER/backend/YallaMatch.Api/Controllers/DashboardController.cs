using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YallaMatch.Api.Data;
using YallaMatch.Api.Entities;

namespace YallaMatch.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "SuperAdmin,Admin")]
public sealed class DashboardController(YallaMatchDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var today = DateOnly.FromDateTime(DateTime.Today).ToString("yyyy-MM-dd");
        var blockedSlots = await db.CourtSlotBlocks
            .Where(block => string.Compare(block.Date, today) >= 0)
            .SumAsync(block => (int?)(block.ToHour - block.FromHour + 1)) ?? 0;
        return Ok(new
        {
            activeCourts = await db.Courts.CountAsync(court => court.IsActive),
            blockedSlots
        });
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var today = DateOnly.FromDateTime(DateTime.Today).ToString("yyyy-MM-dd");
        var reservations = await db.Reservations
            .AsNoTracking()
            .Include(reservation => reservation.Court)
            .Include(reservation => reservation.PaymentConfirmation)
            .OrderByDescending(reservation => reservation.CreatedAtUtc)
            .ToListAsync();
        var courts = await db.Courts
            .AsNoTracking()
            .Where(court => court.IsActive)
            .OrderBy(court => court.Name)
            .Select(court => new
            {
                court.Id,
                court.Name,
                place = court.Place,
                sportType = court.SportType,
                court.Price,
                locationUrl = court.LocationUrl,
                paymentPhone = court.PaymentPhone,
                managerAccountId = court.ManagerAccountId
            })
            .ToListAsync();
        var refunds = await db.RefundRecords
            .AsNoTracking()
            .Include(refund => refund.Reservation)
                .ThenInclude(reservation => reservation.Court)
            .OrderByDescending(refund => refund.RefundedAtUtc)
            .ToListAsync();
        var blockedSlots = await db.CourtSlotBlocks
            .AsNoTracking()
            .Where(block => string.Compare(block.Date, today) >= 0)
            .SumAsync(block => (int?)(block.ToHour - block.FromHour + 1)) ?? 0;
        var pendingRefundRequestsCount = await db.Reservations
            .AsNoTracking()
            .CountAsync(reservation => reservation.PaymentStatus == PaymentStatus.RefundRequested);

        return Ok(new
        {
            reservations = reservations.Select(ReservationDto.From),
            courts,
            refunds = refunds.Select(RefundDto.From),
            summary = new
            {
                activeCourts = courts.Count,
                blockedSlots
            },
            pendingRefundRequestsCount
        });
    }
}
