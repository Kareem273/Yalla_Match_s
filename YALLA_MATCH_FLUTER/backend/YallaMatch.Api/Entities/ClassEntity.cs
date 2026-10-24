namespace YallaMatch.Api.Entities;

public class ClassEntity
{
    public long Id { get; set; }
    public string ClassName { get; set; } = "";
    public long GradeId { get; set; }
    public GradeEntity? Grade { get; set; }
}
