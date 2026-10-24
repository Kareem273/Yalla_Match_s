namespace YallaMatch.Api.Entities;

public class GradeEntity
{
    public long Id { get; set; }
    public string GradeName { get; set; } = "";
    public long? AdminAccountId { get; set; }
}
