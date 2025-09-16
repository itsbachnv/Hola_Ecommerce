using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommer.Migrations
{
    /// <inheritdoc />
    public partial class newATOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerFullName",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "CustomerFullName",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "orders");
        }
    }
}
