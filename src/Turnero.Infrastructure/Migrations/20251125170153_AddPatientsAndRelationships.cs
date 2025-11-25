using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Turnero.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientsAndRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PatientId",
                table: "Turns",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Surname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Dni = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Turns_DoctorId",
                table: "Turns",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Turns_PatientId",
                table: "Turns",
                column: "PatientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Turns_Doctors_DoctorId",
                table: "Turns",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Turns_Patients_PatientId",
                table: "Turns",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Turns_Doctors_DoctorId",
                table: "Turns");

            migrationBuilder.DropForeignKey(
                name: "FK_Turns_Patients_PatientId",
                table: "Turns");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Turns_DoctorId",
                table: "Turns");

            migrationBuilder.DropIndex(
                name: "IX_Turns_PatientId",
                table: "Turns");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "Turns");
        }
    }
}
