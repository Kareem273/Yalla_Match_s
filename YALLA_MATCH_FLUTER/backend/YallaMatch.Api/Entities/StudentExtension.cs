using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YallaMatch.Api.Entities;

public class StudentExtension
{
    [Key]
    public long AccountId { get; set; }
    public bool IsLeader { get; set; }
    public long? ClassId { get; set; }

    [ForeignKey(nameof(AccountId))]
    public AccountEntity? Account { get; set; }
}
