CREATE TABLE Admins (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    Email nvarchar(256) NOT NULL UNIQUE,
    IsActive bit NOT NULL,
    CreatedAtUtc datetimeoffset NOT NULL
);

CREATE TABLE LoginAccounts (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    SubjectId uniqueidentifier NOT NULL,
    Email nvarchar(256) NOT NULL UNIQUE,
    PasswordHash nvarchar(256) NOT NULL,
    Role int NOT NULL,
    IsActive bit NOT NULL,
    CreatedAtUtc datetimeoffset NOT NULL,
    CONSTRAINT FK_LoginAccounts_Admins FOREIGN KEY (SubjectId) REFERENCES Admins(Id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX UX_LoginAccounts_Subject_Role ON LoginAccounts(SubjectId, Role);

CREATE TABLE CourtOwners (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    Name nvarchar(160) NOT NULL,
    Email nvarchar(256) NOT NULL UNIQUE,
    Phone nvarchar(40) NOT NULL,
    IsActive bit NOT NULL
);

CREATE TABLE Courts (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    OwnerId uniqueidentifier NULL,
    Name nvarchar(160) NOT NULL,
    Place nvarchar(240) NOT NULL,
    Price decimal(18,2) NOT NULL,
    LocationUrl nvarchar(2000) NULL,
    PaymentPhone nvarchar(40) NULL,
    ImageData varbinary(max) NULL,
    ImageContentType nvarchar(200) NULL,
    IsActive bit NOT NULL,
    CONSTRAINT FK_Courts_CourtOwners FOREIGN KEY (OwnerId) REFERENCES CourtOwners(Id) ON DELETE SET NULL
);

CREATE TABLE Customers (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    Name nvarchar(160) NULL,
    Phone nvarchar(40) NULL,
    Email nvarchar(256) NULL,
    SessionId nvarchar(160) NOT NULL
);

CREATE TABLE Reservations (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    CourtId uniqueidentifier NOT NULL,
    CustomerId uniqueidentifier NULL,
    CustomerSessionId nvarchar(160) NOT NULL,
    CustomerName nvarchar(160) NULL,
    CustomerPhone nvarchar(40) NULL,
    [Date] nvarchar(10) NOT NULL,
    FromHour int NOT NULL CHECK (FromHour BETWEEN 0 AND 23),
    ToHour int NOT NULL CHECK (ToHour BETWEEN 0 AND 23),
    Price decimal(18,2) NOT NULL,
    Source int NOT NULL,
    Status int NOT NULL,
    PaymentStatus int NOT NULL,
    QrToken nvarchar(256) NULL,
    TrackingCode nvarchar(40) NULL,
    RejectionReason nvarchar(500) NULL,
    CreatedAtUtc datetimeoffset NOT NULL,
    CheckedInAtUtc datetimeoffset NULL,
    CONSTRAINT FK_Reservations_Courts FOREIGN KEY (CourtId) REFERENCES Courts(Id),
    CONSTRAINT FK_Reservations_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE SET NULL,
    CONSTRAINT CK_Reservations_Time CHECK (FromHour <= ToHour)
);

CREATE UNIQUE INDEX UX_Reservations_QrToken ON Reservations(QrToken) WHERE QrToken IS NOT NULL;
CREATE UNIQUE INDEX UX_Reservations_TrackingCode ON Reservations(TrackingCode) WHERE TrackingCode IS NOT NULL;

CREATE TABLE CourtSlotBlocks (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    CourtId uniqueidentifier NOT NULL,
    [Date] nvarchar(10) NOT NULL,
    FromHour int NOT NULL CHECK (FromHour BETWEEN 0 AND 23),
    ToHour int NOT NULL CHECK (ToHour BETWEEN 0 AND 23),
    Reason nvarchar(max) NULL,
    CreatedAtUtc datetimeoffset NOT NULL,
    CONSTRAINT FK_CourtSlotBlocks_Courts FOREIGN KEY (CourtId) REFERENCES Courts(Id) ON DELETE CASCADE,
    CONSTRAINT CK_CourtSlotBlocks_Time CHECK (FromHour <= ToHour),
    CONSTRAINT UX_CourtSlotBlocks_Court_Date_Time UNIQUE (CourtId, [Date], FromHour, ToHour)
);

CREATE TABLE PaymentConfirmations (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    ReservationId uniqueidentifier NOT NULL UNIQUE,
    ScreenshotPath nvarchar(max) NOT NULL,
    Status int NOT NULL,
    RejectionReason nvarchar(500) NULL,
    UploadedAtUtc datetimeoffset NOT NULL,
    ReviewedAtUtc datetimeoffset NULL,
    CONSTRAINT FK_PaymentConfirmations_Reservations FOREIGN KEY (ReservationId) REFERENCES Reservations(Id) ON DELETE CASCADE
);

CREATE TABLE RefundRecords (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    ReservationId uniqueidentifier NOT NULL UNIQUE,
    Amount decimal(18,2) NOT NULL,
    Reason nvarchar(500) NULL,
    RefundedAtUtc datetimeoffset NOT NULL,
    CONSTRAINT FK_RefundRecords_Reservations FOREIGN KEY (ReservationId) REFERENCES Reservations(Id) ON DELETE CASCADE
);

CREATE TABLE AuditLogs (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    Timestamp datetimeoffset NOT NULL,
    AdminEmail nvarchar(256) NOT NULL,
    AdminRole nvarchar(100) NOT NULL,
    Action nvarchar(100) NOT NULL,
    Details nvarchar(max) NOT NULL,
    Category nvarchar(100) NOT NULL
);

CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp);
