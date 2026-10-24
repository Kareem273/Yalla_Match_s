using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YallaMatch.Api.Migrations
{
    /// <inheritdoc />
    public partial class SecureCustomerSessionsAndQueryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_CourtId",
                table: "Reservations");

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "Reservations",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerSessionId",
                table: "Reservations",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "SportType",
                table: "Courts",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Soccer",
                oldClrType: typeof(string),
                oldType: "nvarchar(32)",
                oldMaxLength: 32,
                oldDefaultValue: "Football");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Courts",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CourtId_Date_FromHour_ToHour",
                table: "Reservations",
                columns: new[] { "CourtId", "Date", "FromHour", "ToHour" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomerSessionId_CreatedAtUtc",
                table: "Reservations",
                columns: new[] { "CustomerSessionId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_PaymentStatus_CreatedAtUtc",
                table: "Reservations",
                columns: new[] { "PaymentStatus", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Courts_IsActive_SportType_Name",
                table: "Courts",
                columns: new[] { "IsActive", "SportType", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Timestamp",
                table: "AuditLogs",
                column: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_CourtId_Date_FromHour_ToHour",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomerSessionId_CreatedAtUtc",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_PaymentStatus_CreatedAtUtc",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Courts_IsActive_SportType_Name",
                table: "Courts");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_Timestamp",
                table: "AuditLogs");

            migrationBuilder.AlterColumn<string>(
                name: "Date",
                table: "Reservations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "CustomerSessionId",
                table: "Reservations",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64);

            migrationBuilder.AlterColumn<string>(
                name: "SportType",
                table: "Courts",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Football",
                oldClrType: typeof(string),
                oldType: "nvarchar(32)",
                oldMaxLength: 32,
                oldDefaultValue: "Soccer");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Courts",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CourtId",
                table: "Reservations",
                column: "CourtId");
        }
    }
}
