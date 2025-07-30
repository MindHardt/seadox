using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CoreApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedWorkspaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "workspaces",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    doc_id = table.Column<int>(type: "integer", nullable: false),
                    access = table.Column<short>(type: "smallint", nullable: false),
                    inherits = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_workspaces", x => x.id);
                    table.ForeignKey(
                        name: "fk_workspaces_seadocs_doc_id",
                        column: x => x.doc_id,
                        principalTable: "seadocs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "invite_codes",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    workspace_id = table.Column<int>(type: "integer", nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invite_codes", x => x.id);
                    table.ForeignKey(
                        name: "fk_invite_codes_workspaces_workspace_id",
                        column: x => x.workspace_id,
                        principalTable: "workspaces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "invite_visits",
                columns: table => new
                {
                    invite_code_id = table.Column<long>(type: "bigint", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invite_visits", x => new { x.invite_code_id, x.user_id });
                    table.ForeignKey(
                        name: "fk_invite_visits_invite_codes_invite_code_id",
                        column: x => x.invite_code_id,
                        principalTable: "invite_codes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_invite_visits_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_invite_codes_workspace_id",
                table: "invite_codes",
                column: "workspace_id",
                unique: true,
                filter: "active");

            migrationBuilder.CreateIndex(
                name: "ix_invite_visits_user_id",
                table: "invite_visits",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_workspaces_doc_id",
                table: "workspaces",
                column: "doc_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "invite_visits");

            migrationBuilder.DropTable(
                name: "invite_codes");

            migrationBuilder.DropTable(
                name: "workspaces");
        }
    }
}
