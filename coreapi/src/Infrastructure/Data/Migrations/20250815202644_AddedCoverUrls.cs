using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Seadox.CoreApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedCoverUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cover_url",
                table: "seadocs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cover_url",
                table: "seadocs");
        }
    }
}
