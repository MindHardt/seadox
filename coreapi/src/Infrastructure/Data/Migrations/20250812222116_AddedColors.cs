using Seadox.CoreApi.Features.Colors;
using Microsoft.EntityFrameworkCore.Migrations;
using Color = Seadox.CoreApi.Features.Colors.Color;

#nullable disable

namespace Seadox.CoreApi.Infrastructure.Data.Migrations
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
                defaultValue: Color.Sky.Value);
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
