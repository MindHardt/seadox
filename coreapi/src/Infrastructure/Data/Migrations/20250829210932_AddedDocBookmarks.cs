using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Seadox.CoreApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedDocBookmarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bookmarks",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    doc_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookmarks", x => new { x.doc_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_bookmarks_seadocs_doc_id",
                        column: x => x.doc_id,
                        principalTable: "seadocs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_bookmarks_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookmarks_user_id",
                table: "bookmarks",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bookmarks");
        }
    }
}
