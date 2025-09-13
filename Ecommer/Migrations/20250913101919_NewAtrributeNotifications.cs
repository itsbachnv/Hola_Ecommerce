using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommer.Migrations
{
    /// <inheritdoc />
    public partial class NewAtrributeNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "notifications",
                newName: "NotificationType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "NotificationType",
                table: "notifications",
                newName: "Type");
        }
    }
}
