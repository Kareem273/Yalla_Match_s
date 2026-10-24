using YallaMatch.Api.Entities;

namespace YallaMatch.Api.Contracts;

public sealed record LoginRequest(string Email, string Password);

public sealed record CreateCourtRequest(
    string Name,
    string Place,
    decimal Price,
    string? LocationUrl,
    string? PaymentPhone,
    long? ManagerAccountId,
    CourtSportType SportType = CourtSportType.Football);

public sealed class CreateCourtImageRequest
{
    public string Name { get; init; } = "";
    public string Place { get; init; } = "";
    public decimal Price { get; init; }
    public string? LocationUrl { get; init; }
    public string? PaymentPhone { get; init; }
    public long? ManagerAccountId { get; init; }
    public CourtSportType SportType { get; init; } = CourtSportType.Football;
    public IFormFile? Image { get; init; }
}

public sealed class UpdateCourtImageRequest
{
    public string? Name { get; init; }
    public string? Place { get; init; }
    public decimal Price { get; init; }
    public string? LocationUrl { get; init; }
    public string? PaymentPhone { get; init; }
    public long? ManagerAccountId { get; init; }
    public CourtSportType SportType { get; init; } = CourtSportType.Football;
    public IFormFile? Image { get; init; }
}

public sealed record CreateReservationRequest(
    Guid CourtId,
    string Date,
    int FromHour,
    int ToHour,
    string? CustomerName,
    string? CustomerPhone);

public sealed record CreateOfflineReservationRequest(
    Guid CourtId,
    string Date,
    int FromHour,
    int ToHour,
    string? CustomerName,
    string? CustomerPhone);

public sealed record ManageCourtSlotRequest(
    string Date,
    int FromHour,
    int ToHour,
    string? Reason);

public sealed record CancelReservationRequest(string? Reason);

public sealed record ProcessRefundRequest(string? Reason);

public sealed record RejectPaymentRequest(string Reason);

public sealed record UpdateReservationCustomerRequest(string? CustomerName, string? CustomerPhone);

public sealed record QrRequest(string QrToken);
