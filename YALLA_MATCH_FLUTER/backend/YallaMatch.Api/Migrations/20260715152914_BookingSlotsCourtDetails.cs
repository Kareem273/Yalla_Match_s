using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YallaMatch.Api.Migrations;

/// <summary>
/// Establishes the first EF migration while safely upgrading the schema that
/// existed before migrations were introduced to this project.
/// </summary>
public partial class BookingSlotsCourtDetails : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF OBJECT_ID(N'[Admins]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Admins] (
                    [Id] uniqueidentifier NOT NULL,
                    [Email] nvarchar(450) NOT NULL,
                    [IsActive] bit NOT NULL,
                    [CreatedAtUtc] datetimeoffset NOT NULL,
                    CONSTRAINT [PK_Admins] PRIMARY KEY ([Id])
                );

                CREATE TABLE [CourtOwners] (
                    [Id] uniqueidentifier NOT NULL,
                    [Name] nvarchar(max) NOT NULL,
                    [Email] nvarchar(450) NOT NULL,
                    [Phone] nvarchar(max) NOT NULL,
                    [IsActive] bit NOT NULL,
                    CONSTRAINT [PK_CourtOwners] PRIMARY KEY ([Id])
                );

                CREATE TABLE [Customers] (
                    [Id] uniqueidentifier NOT NULL,
                    [Name] nvarchar(max) NULL,
                    [Phone] nvarchar(max) NULL,
                    [Email] nvarchar(max) NULL,
                    [SessionId] nvarchar(max) NOT NULL,
                    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
                );

                CREATE TABLE [LoginAccounts] (
                    [Id] uniqueidentifier NOT NULL,
                    [SubjectId] uniqueidentifier NOT NULL,
                    [Email] nvarchar(450) NOT NULL,
                    [PasswordHash] nvarchar(max) NOT NULL,
                    [Role] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    [CreatedAtUtc] datetimeoffset NOT NULL,
                    CONSTRAINT [PK_LoginAccounts] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_LoginAccounts_Admins_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [Admins] ([Id]) ON DELETE CASCADE
                );

                CREATE TABLE [Courts] (
                    [Id] uniqueidentifier NOT NULL,
                    [OwnerId] uniqueidentifier NULL,
                    [Name] nvarchar(max) NOT NULL,
                    [Place] nvarchar(max) NOT NULL,
                    [Price] decimal(18,2) NOT NULL,
                    [ImageUrl] nvarchar(max) NULL,
                    [LocationUrl] nvarchar(max) NULL,
                    [PaymentPhone] nvarchar(max) NULL,
                    [IsActive] bit NOT NULL,
                    CONSTRAINT [PK_Courts] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Courts_CourtOwners_OwnerId] FOREIGN KEY ([OwnerId]) REFERENCES [CourtOwners] ([Id]) ON DELETE SET NULL
                );

                CREATE TABLE [CourtSlotBlocks] (
                    [Id] uniqueidentifier NOT NULL,
                    [CourtId] uniqueidentifier NOT NULL,
                    [Date] nvarchar(450) NOT NULL,
                    [FromHour] int NOT NULL,
                    [ToHour] int NOT NULL,
                    [Reason] nvarchar(max) NULL,
                    [CreatedAtUtc] datetimeoffset NOT NULL,
                    CONSTRAINT [PK_CourtSlotBlocks] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_CourtSlotBlocks_Courts_CourtId] FOREIGN KEY ([CourtId]) REFERENCES [Courts] ([Id]) ON DELETE CASCADE
                );

                CREATE TABLE [Reservations] (
                    [Id] uniqueidentifier NOT NULL,
                    [CourtId] uniqueidentifier NOT NULL,
                    [CustomerId] uniqueidentifier NULL,
                    [CustomerSessionId] nvarchar(max) NOT NULL,
                    [CustomerName] nvarchar(max) NULL,
                    [CustomerPhone] nvarchar(max) NULL,
                    [Date] nvarchar(max) NOT NULL,
                    [FromHour] int NOT NULL,
                    [ToHour] int NOT NULL,
                    [Price] decimal(18,2) NOT NULL,
                    [Source] int NOT NULL,
                    [Status] int NOT NULL,
                    [PaymentStatus] int NOT NULL,
                    [QrToken] nvarchar(450) NULL,
                    [TrackingCode] nvarchar(450) NULL,
                    [RejectionReason] nvarchar(max) NULL,
                    [CreatedAtUtc] datetimeoffset NOT NULL,
                    [CheckedInAtUtc] datetimeoffset NULL,
                    CONSTRAINT [PK_Reservations] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_Reservations_Courts_CourtId] FOREIGN KEY ([CourtId]) REFERENCES [Courts] ([Id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_Reservations_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE SET NULL
                );

                CREATE TABLE [PaymentConfirmations] (
                    [Id] uniqueidentifier NOT NULL,
                    [ReservationId] uniqueidentifier NOT NULL,
                    [ScreenshotPath] nvarchar(max) NOT NULL,
                    [Status] int NOT NULL,
                    [RejectionReason] nvarchar(max) NULL,
                    [UploadedAtUtc] datetimeoffset NOT NULL,
                    [ReviewedAtUtc] datetimeoffset NULL,
                    CONSTRAINT [PK_PaymentConfirmations] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_PaymentConfirmations_Reservations_ReservationId] FOREIGN KEY ([ReservationId]) REFERENCES [Reservations] ([Id]) ON DELETE CASCADE
                );

                CREATE UNIQUE INDEX [IX_Admins_Email] ON [Admins] ([Email]);
                CREATE UNIQUE INDEX [IX_CourtOwners_Email] ON [CourtOwners] ([Email]);
                CREATE INDEX [IX_Courts_OwnerId] ON [Courts] ([OwnerId]);
                CREATE UNIQUE INDEX [IX_CourtSlotBlocks_CourtId_Date_FromHour_ToHour] ON [CourtSlotBlocks] ([CourtId], [Date], [FromHour], [ToHour]);
                CREATE UNIQUE INDEX [IX_LoginAccounts_Email] ON [LoginAccounts] ([Email]);
                CREATE UNIQUE INDEX [IX_LoginAccounts_SubjectId] ON [LoginAccounts] ([SubjectId]);
                CREATE UNIQUE INDEX [IX_LoginAccounts_SubjectId_Role] ON [LoginAccounts] ([SubjectId], [Role]);
                CREATE UNIQUE INDEX [IX_PaymentConfirmations_ReservationId] ON [PaymentConfirmations] ([ReservationId]);
                CREATE INDEX [IX_Reservations_CourtId] ON [Reservations] ([CourtId]);
                CREATE INDEX [IX_Reservations_CustomerId] ON [Reservations] ([CustomerId]);
                CREATE UNIQUE INDEX [IX_Reservations_QrToken] ON [Reservations] ([QrToken]) WHERE [QrToken] IS NOT NULL;
                CREATE UNIQUE INDEX [IX_Reservations_TrackingCode] ON [Reservations] ([TrackingCode]) WHERE [TrackingCode] IS NOT NULL;
            END
            ELSE
            BEGIN
                IF COL_LENGTH(N'dbo.Courts', N'LocationUrl') IS NULL
                    ALTER TABLE [Courts] ADD [LocationUrl] nvarchar(max) NULL;

                IF COL_LENGTH(N'dbo.Courts', N'PaymentPhone') IS NULL
                    ALTER TABLE [Courts] ADD [PaymentPhone] nvarchar(max) NULL;

                IF COL_LENGTH(N'dbo.Reservations', N'Source') IS NULL
                    ALTER TABLE [Reservations] ADD [Source] int NOT NULL CONSTRAINT [DF_Reservations_Source] DEFAULT 1 WITH VALUES;

                IF OBJECT_ID(N'[CourtSlotBlocks]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [CourtSlotBlocks] (
                        [Id] uniqueidentifier NOT NULL,
                        [CourtId] uniqueidentifier NOT NULL,
                        [Date] nvarchar(450) NOT NULL,
                        [FromHour] int NOT NULL,
                        [ToHour] int NOT NULL,
                        [Reason] nvarchar(max) NULL,
                        [CreatedAtUtc] datetimeoffset NOT NULL,
                        CONSTRAINT [PK_CourtSlotBlocks] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_CourtSlotBlocks_Courts_CourtId] FOREIGN KEY ([CourtId]) REFERENCES [Courts] ([Id]) ON DELETE CASCADE
                    );
                    CREATE UNIQUE INDEX [IX_CourtSlotBlocks_CourtId_Date_FromHour_ToHour] ON [CourtSlotBlocks] ([CourtId], [Date], [FromHour], [ToHour]);
                END
            END
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // This migration also baselines a database that predates EF migrations.
        // An automatic Down script could delete that pre-existing data, so rollback is intentionally a no-op.
    }
}
