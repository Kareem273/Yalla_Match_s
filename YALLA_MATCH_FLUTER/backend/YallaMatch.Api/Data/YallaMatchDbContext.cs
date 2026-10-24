using Microsoft.EntityFrameworkCore;
using YallaMatch.Api.Entities;

namespace YallaMatch.Api.Data;

public sealed class YallaMatchDbContext(DbContextOptions<YallaMatchDbContext> options) : DbContext(options)
{
    // YallaMatch Core DbSets
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<LoginAccount> LoginAccounts => Set<LoginAccount>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<CourtSlotBlock> CourtSlotBlocks => Set<CourtSlotBlock>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<PaymentConfirmation> PaymentConfirmations => Set<PaymentConfirmation>();
    public DbSet<RefundRecord> RefundRecords => Set<RefundRecord>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // School System & RMS Core DbSets
    public DbSet<AccountEntity> Accounts => Set<AccountEntity>();
    public DbSet<StudentExtension> StudentExtensions => Set<StudentExtension>();
    public DbSet<GradeEntity> Grades => Set<GradeEntity>();
    public DbSet<ClassEntity> Classes => Set<ClassEntity>();
    public DbSet<ProjectEntity> Projects => Set<ProjectEntity>();
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>().HasIndex(a => a.Email).IsUnique();
        modelBuilder.Entity<LoginAccount>().HasIndex(a => a.Email).IsUnique();
        modelBuilder.Entity<LoginAccount>().HasIndex(a => new { a.SubjectId, a.Role }).IsUnique();
        modelBuilder.Entity<AccountEntity>().HasIndex(a => a.Email).IsUnique();

        modelBuilder.Entity<Admin>()
            .HasOne(a => a.LoginAccount)
            .WithOne()
            .HasForeignKey<LoginAccount>(a => a.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Court>()
            .HasOne(c => c.ManagerAccount)
            .WithMany()
            .HasForeignKey(c => c.ManagerAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Court)
            .WithMany(c => c.Reservations)
            .HasForeignKey(r => r.CourtId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Customer)
            .WithMany(c => c.Reservations)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CourtSlotBlock>()
            .HasOne(s => s.Court)
            .WithMany(c => c.SlotBlocks)
            .HasForeignKey(s => s.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reservation>().Property(r => r.CustomerSessionId).HasMaxLength(64);
        modelBuilder.Entity<Reservation>().Property(r => r.TrackingCode).HasMaxLength(40);
        modelBuilder.Entity<Reservation>().HasIndex(r => new { r.CustomerSessionId, r.CreatedAtUtc });
        modelBuilder.Entity<Reservation>().HasIndex(r => new { r.CourtId, r.Date, r.FromHour, r.ToHour });
        modelBuilder.Entity<Reservation>().HasIndex(r => new { r.PaymentStatus, r.CreatedAtUtc });
        modelBuilder.Entity<Reservation>().HasIndex(r => r.QrToken).IsUnique().HasFilter("[QrToken] IS NOT NULL");
        modelBuilder.Entity<Reservation>().HasIndex(r => r.TrackingCode).IsUnique().HasFilter("[TrackingCode] IS NOT NULL");
        modelBuilder.Entity<CourtSlotBlock>().HasIndex(s => new { s.CourtId, s.Date, s.FromHour, s.ToHour }).IsUnique();
        modelBuilder.Entity<Court>().HasIndex(c => new { c.IsActive, c.SportType, c.Name });
        modelBuilder.Entity<AuditLog>().HasIndex(log => log.Timestamp);

        modelBuilder.Entity<PaymentConfirmation>()
            .HasOne(p => p.Reservation)
            .WithOne(r => r.PaymentConfirmation)
            .HasForeignKey<PaymentConfirmation>(p => p.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefundRecord>()
            .HasOne(r => r.Reservation)
            .WithOne(r => r.Refund)
            .HasForeignKey<RefundRecord>(r => r.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Court>().Property(c => c.Price).HasPrecision(18, 2);
        modelBuilder.Entity<Court>()
            .Property(c => c.SportType)
            .HasConversion<string>()
            .HasMaxLength(32)
            .HasDefaultValue(CourtSportType.Football);
        modelBuilder.Entity<Reservation>().Property(r => r.Price).HasPrecision(18, 2);
        modelBuilder.Entity<RefundRecord>().Property(r => r.Amount).HasPrecision(18, 2);
    }
}
