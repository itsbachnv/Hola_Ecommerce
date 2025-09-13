using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Ecommer.Migrations
{
    /// <inheritdoc />
    public partial class NewAtrributeChatMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_chat_messages_users_UserId",
                table: "chat_messages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_notifications",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "IX_chat_messages_UserId",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "RelatedObjectType",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "Meta",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "chat_messages");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "notifications",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "chat_messages",
                newName: "SenderId");

            migrationBuilder.AlterColumn<int>(
                name: "RelatedObjectId",
                table: "notifications",
                type: "integer",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "notifications",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "NotificationId",
                table: "notifications",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "notifications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "chat_messages",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "chat_messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "chat_messages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReceiverId",
                table: "chat_messages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "chat_messages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddPrimaryKey(
                name: "PK_notifications",
                table: "notifications",
                column: "NotificationId");

            migrationBuilder.CreateTable(
                name: "guest_infos",
                columns: table => new
                {
                    GuestId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    IPAddress = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    LastMessageAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "new")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_guest_infos", x => x.GuestId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_notifications_UserId",
                table: "notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_SenderId_ReceiverId",
                table: "chat_messages",
                columns: new[] { "SenderId", "ReceiverId" });

            migrationBuilder.CreateIndex(
                name: "IX_guest_infos_Email",
                table: "guest_infos",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_guest_infos_PhoneNumber",
                table: "guest_infos",
                column: "PhoneNumber");
            
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_notifications_users_UserId",
                table: "notifications");

            migrationBuilder.DropTable(
                name: "guest_infos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_notifications",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "IX_notifications_UserId",
                table: "notifications");

            migrationBuilder.DropIndex(
                name: "IX_chat_messages_SenderId_ReceiverId",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "NotificationId",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "ReceiverId",
                table: "chat_messages");

            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "chat_messages");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "notifications",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "SenderId",
                table: "chat_messages",
                newName: "Content");

            migrationBuilder.AlterColumn<long>(
                name: "RelatedObjectId",
                table: "notifications",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "notifications",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "RelatedObjectType",
                table: "notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SenderId",
                table: "notifications",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "chat_messages",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "chat_messages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<JsonDocument>(
                name: "Meta",
                table: "chat_messages",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "chat_messages",
                type: "chat_role",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "chat_messages",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_notifications",
                table: "notifications",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_UserId",
                table: "chat_messages",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_chat_messages_users_UserId",
                table: "chat_messages",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
