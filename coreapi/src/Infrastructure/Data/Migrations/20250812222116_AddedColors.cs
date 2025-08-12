using CoreApi.Features.Colors;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoreApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: Color.DefaultPalette.Sky.Value);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "color",
                table: "users");
        }
    }
}
