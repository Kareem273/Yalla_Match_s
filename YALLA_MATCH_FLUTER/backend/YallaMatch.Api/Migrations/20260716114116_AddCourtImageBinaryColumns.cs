using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YallaMatch.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCourtImageBinaryColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageContentType",
                table: "Courts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "ImageData",
                table: "Courts",
                type: "varbinary(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageContentType",
                table: "Courts");

            migrationBuilder.DropColumn(
                name: "ImageData",
                table: "Courts");
        }
    }
}
