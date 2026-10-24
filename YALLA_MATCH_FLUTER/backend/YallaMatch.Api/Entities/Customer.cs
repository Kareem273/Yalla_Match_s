namespace YallaMatch.Api.Entities;

public sealed class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string SessionId { get; set; } = "";
    public List<Reservation> Reservations { get; set; } = [];
}
