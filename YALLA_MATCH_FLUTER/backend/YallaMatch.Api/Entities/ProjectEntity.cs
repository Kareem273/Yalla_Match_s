namespace YallaMatch.Api.Entities;

public class ProjectEntity
{
    public long Id { get; set; }
    public string NameEN { get; set; } = "";
    public string? ProjectDescription { get; set; }
    public long SupervisorAccountId { get; set; }
}
