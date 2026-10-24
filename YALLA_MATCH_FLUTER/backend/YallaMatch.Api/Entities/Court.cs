namespace YallaMatch.Api.Entities;

public sealed class Court
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public long? ManagerAccountId { get; set; }
    public AccountEntity? ManagerAccount { get; set; }
    public string Name { get; set; } = "";
    public string Place { get; set; } = "";
    public CourtSportType SportType { get; set; } = CourtSportType.Football;
    public decimal Price { get; set; }
    public string? LocationUrl { get; set; }
    public string? PaymentPhone { get; set; }
    public byte[]? ImageData { get; set; }
    public string? ImageContentType { get; set; }
    public bool IsActive { get; set; } = true;
    public List<Reservation> Reservations { get; set; } = [];
    public List<CourtSlotBlock> SlotBlocks { get; set; } = [];
}
