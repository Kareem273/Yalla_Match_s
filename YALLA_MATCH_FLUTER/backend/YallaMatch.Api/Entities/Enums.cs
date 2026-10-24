using System.Text.Json.Serialization;

namespace YallaMatch.Api.Entities;

public enum UserRole
{
    SuperAdmin = 0,
    Admin = 1,
    CourtOwner = 2,
    Customer = 3
}

public enum ReservationStatus
{
    AwaitingPaymentScreenshot = 1,
    PendingPaymentVerification = 2,
    Confirmed = 3,
    Rejected = 4,
    CheckedIn = 5,
    Cancelled = 6
}

public enum PaymentStatus
{
    NotUploaded = 1,
    PendingVerification = 2,
    Approved = 3,
    Rejected = 4,
    Refunded = 5,
    RefundRequested = 6
}

public enum BookingSource
{
    Online = 1,
    Offline = 2
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CourtSportType
{
    Soccer = 0,
    Basketball = 1,
    Volleyball = 2,
    TableTennis = 3,
    Football = 0,
    Multipurpose = 4
}

