using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YallaMatch.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtSportType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Some existing installations already have this column from an
            // earlier database setup, although it was not in EF's migration
            // history. Keep the migration safe for both database states.
            migrationBuilder.Sql("""
                IF COL_LENGTH(N'dbo.Courts', N'SportType') IS NULL
                BEGIN
                    ALTER TABLE [dbo].[Courts]
                    ADD [SportType] nvarchar(32) NOT NULL
                    CONSTRAINT [DF_Courts_SportType] DEFAULT N'Football';
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SportType",
                table: "Courts");
        }
    }
}
