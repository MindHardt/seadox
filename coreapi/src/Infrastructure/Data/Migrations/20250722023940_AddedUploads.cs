using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CoreApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedUploads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "storage_used",
                table: "users",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "uploads",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false, collation: "C"),
                    content_type = table.Column<string>(type: "text", nullable: false),
                    file_name = table.Column<string>(type: "text", nullable: false),
                    scope = table.Column<short>(type: "smallint", nullable: false),
                    file_size = table.Column<long>(type: "bigint", nullable: false),
                    uploader_id = table.Column<int>(type: "integer", nullable: false),
                    upload_time = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_uploads", x => x.id);
                    table.ForeignKey(
                        name: "fk_uploads_users_uploader_id",
                        column: x => x.uploader_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_uploads_hash",
                table: "uploads",
                column: "hash");

            migrationBuilder.CreateIndex(
                name: "ix_uploads_uploader_id",
                table: "uploads",
                column: "uploader_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "uploads");

            migrationBuilder.DropColumn(
                name: "storage_used",
                table: "users");
        }
    }
}
