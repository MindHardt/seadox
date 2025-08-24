using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoreApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SplitDocumentShareIntoTwoColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "share",
                table: "seadocs");

            migrationBuilder.AddColumn<short>(
                name: "share_access",
                table: "seadocs",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<short>(
                name: "share_type",
                table: "seadocs",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "share_access",
                table: "seadocs");

            migrationBuilder.DropColumn(
                name: "share_type",
                table: "seadocs");

            migrationBuilder.AddColumn<string>(
                name: "share",
                table: "seadocs",
                type: "jsonb",
                nullable: false,
                defaultValue: "{}");
        }
    }
}
