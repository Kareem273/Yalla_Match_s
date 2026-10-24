using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YallaMatch.Api.Contracts;
using YallaMatch.Api.Data;
using YallaMatch.Api.Entities;
using YallaMatch.Api.Security;

namespace YallaMatch.Api.Controllers;

[ApiController]
[Route("api/courts")]
public sealed class CourtsController(YallaMatchDbContext db, IWebHostEnvironment env) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCourts([FromQuery] string? sportType)
    {
        var courtQuery = db.Courts.AsNoTracking().Where(c => c.IsActive);
        if (!string.IsNullOrWhiteSpace(sportType))
        {
            var st = sportType.Trim();
            if (st.Equals("football", StringComparison.OrdinalIgnoreCase)) st = "Soccer";
            if (st.Equals("tennis table", StringComparison.OrdinalIgnoreCase) || st.Equals("table tennis", StringComparison.OrdinalIgnoreCase)) st = "TableTennis";

            if (Enum.TryParse<CourtSportType>(st, true, out var parsedSport))
            {
                courtQuery = courtQuery.Where(c => c.SportType == parsedSport);
            }
        }

        var courts = await courtQuery
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                place = c.Place,
                sportType = c.SportType,
                c.Price,
                locationUrl = c.LocationUrl,
                paymentPhone = c.PaymentPhone,
                managerAccountId = c.ManagerAccountId
            })
            .ToListAsync();

        Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
        {
            Public = true,
            MaxAge = TimeSpan.FromSeconds(60)
        };
        return Ok(courts);
    }

    [HttpPost]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> CreateCourt(CreateCourtRequest request)
    {
        if (!IsValidLocationUrl(request.LocationUrl)) return BadRequest("A valid location link is required.");
        if (string.IsNullOrWhiteSpace(request.PaymentPhone)) return BadRequest("A payment phone number is required.");

        var court = new Court
        {
            Name = request.Name,
            Place = request.Place,
            SportType = request.SportType,
            Price = request.Price,
            LocationUrl = request.LocationUrl?.Trim(),
            PaymentPhone = request.PaymentPhone.Trim()
        };

        db.Courts.Add(court);
        await db.SaveChangesAsync();

        return Created($"/api/courts/{court.Id}", ToResponse(court));
    }

    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    [RequestSizeLimit(ImageUploads.MaxImageSizeBytes)]
    public async Task<IActionResult> CreateCourtWithImage([FromForm] CreateCourtImageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Place) || request.Price <= 0)
            return BadRequest("Name, place, and a valid price are required.");
        if (!IsValidLocationUrl(request.LocationUrl)) return BadRequest("A valid location link is required.");
        if (string.IsNullOrWhiteSpace(request.PaymentPhone)) return BadRequest("A payment phone number is required.");
        if (!ImageUploads.TryValidate(request.Image, out var contentType, out _, out var validationError)) return BadRequest(validationError);

        await using var memoryStream = new MemoryStream();
        await request.Image!.CopyToAsync(memoryStream);
        var imageBytes = memoryStream.ToArray();

        var court = new Court
        {
            Name = request.Name.Trim(),
            Place = request.Place.Trim(),
            SportType = request.SportType,
            Price = request.Price,
            LocationUrl = request.LocationUrl!.Trim(),
            PaymentPhone = request.PaymentPhone.Trim(),
            ImageData = imageBytes,
            ImageContentType = contentType
        };
        db.Courts.Add(court);
        await db.SaveChangesAsync();

        return Created($"/api/courts/{court.Id}", ToResponse(court));
    }

    [HttpPut("{courtId:guid}")]
    [Consumes("multipart/form-data")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    [RequestSizeLimit(ImageUploads.MaxImageSizeBytes)]
    public async Task<IActionResult> UpdateCourt(Guid courtId, [FromForm] UpdateCourtImageRequest request)
    {
        var court = await db.Courts.FirstOrDefaultAsync(c => c.Id == courtId);
        if (court is null) return NotFound("Court not found.");

        if (!string.IsNullOrWhiteSpace(request.Name)) court.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.Place)) court.Place = request.Place.Trim();
        if (request.Price > 0) court.Price = request.Price;
        if (!string.IsNullOrWhiteSpace(request.LocationUrl) && IsValidLocationUrl(request.LocationUrl))
            court.LocationUrl = request.LocationUrl.Trim();
        if (!string.IsNullOrWhiteSpace(request.PaymentPhone)) court.PaymentPhone = request.PaymentPhone.Trim();
        court.SportType = request.SportType;

        if (request.Image is not null && request.Image.Length > 0)
        {
            if (!ImageUploads.TryValidate(request.Image, out var contentType, out _, out var validationError)) return BadRequest(validationError);
            await using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream);
            court.ImageData = memoryStream.ToArray();
            court.ImageContentType = contentType;
        }

        await db.SaveChangesAsync();
        return Ok(ToResponse(court));
    }

    [HttpDelete("{courtId:guid}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> DeleteCourt(Guid courtId)
    {
        var court = await db.Courts.FirstOrDefaultAsync(c => c.Id == courtId);
        if (court is null) return NotFound();

        court.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{courtId:guid}/image")]
    public async Task<IActionResult> GetCourtImage(Guid courtId)
    {
        var court = await db.Courts.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courtId && c.IsActive);
        if (court is null)
        {
            return NotFound();
        }

        if (court.ImageData is not null && court.ImageData.Length > 0)
        {
            var contentType = string.IsNullOrWhiteSpace(court.ImageContentType) ? "application/octet-stream" : court.ImageContentType;
            Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
            {
                Public = true,
                MaxAge = TimeSpan.FromDays(7)
            };
            return File(court.ImageData, contentType);
        }

        var placeholderPath = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), "placeholder.jpg");
        if (System.IO.File.Exists(placeholderPath))
        {
            var placeholderBytes = System.IO.File.ReadAllBytes(placeholderPath);
            return File(placeholderBytes, "image/jpeg");
        }

        // Fallback transparent 1x1 PNG bytes to avoid server crash when file does not exist
        byte[] fallbackPng = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 213, 196, 237, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 96, 248, 15, 0, 1, 5, 1, 2, 218, 167, 187, 86, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130];
        return File(fallbackPng, "image/png");
    }

    [HttpGet("{courtId:guid}/slots")]
    public async Task<IActionResult> GetCourtSlots(Guid courtId, [FromQuery] string date)
    {
        if (!IsValidDate(date)) return BadRequest("Date must use yyyy-MM-dd.");
        if (!await db.Courts.AnyAsync(c => c.Id == courtId && c.IsActive)) return NotFound("Court not found.");

        var reservations = await db.Reservations
            .Where(r => r.CourtId == courtId && r.Date == date && r.Status != ReservationStatus.Rejected && r.Status != ReservationStatus.Cancelled && r.Status != ReservationStatus.AwaitingPaymentScreenshot)
            .Select(r => new { r.Id, r.FromHour, r.ToHour, source = r.Source.ToString() })
            .ToListAsync();
        var blocks = await db.CourtSlotBlocks
            .Where(s => s.CourtId == courtId && s.Date == date)
            .Select(s => new { s.Id, s.FromHour, s.ToHour })
            .ToListAsync();

        var now = DateTimeOffset.Now;
        var slotDate = DateOnly.TryParseExact(date, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsedDate) ? parsedDate : default;
        var today = DateOnly.FromDateTime(now.DateTime);

        var slots = Enumerable.Range(0, 24).Select(hour =>
        {
            var reservation = reservations.FirstOrDefault(r => r.FromHour <= hour && r.ToHour >= hour);
            var block = blocks.FirstOrDefault(s => s.FromHour <= hour && s.ToHour >= hour);
            var timeExpired = slotDate < today || (slotDate == today && hour <= now.Hour);
            var effectiveStatus = reservation is not null ? "Booked" : (block is not null || timeExpired) ? "Blocked" : "Available";
            return new
            {
                hour,
                status = effectiveStatus,
                reservationId = reservation?.Id,
                source = reservation?.source,
                blockId = block?.Id,
                expired = timeExpired
            };
        });

        return Ok(slots);
    }

    private static bool IsValidLocationUrl(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    private static object ToResponse(Court court) => new
    {
        court.Id,
        court.Name,
        place = court.Place,
        sportType = court.SportType,
        court.Price,
        locationUrl = court.LocationUrl,
        paymentPhone = court.PaymentPhone,
        managerAccountId = court.ManagerAccountId,
        imageUrl = $"/api/courts/{court.Id}/image"
    };

    private static bool IsValidDate(string value) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out _);
}
