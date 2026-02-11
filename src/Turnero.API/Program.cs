using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Turnero.Application;
using Turnero.Application.Services;
using Turnero.API.Hubs;
using Turnero.Infrastructure;

// 1. CREACIÓN DEL BUILDER
// Inicializa la aplicación web y carga la configuración (appsettings.json, variables de entorno, etc.)
var builder = WebApplication.CreateBuilder(args);

// --- ZONA DE INYECCIÓN DE DEPENDENCIAS (DI) ---
// Aquí registramos todas las clases que nuestra app necesita para funcionar.

// Configuración de Entity Framework Core con SQL Server
builder.Services.AddDbContext<TurneroDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registro de Servicios Propios (Lógica de Negocio)
// AddScoped: Se crea una instancia nueva por cada petición HTTP. Es lo estándar para servicios que usan DB.
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TurnService>();
builder.Services.AddScoped<DoctorService>();

// Configuración de Controladores y JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // IMPORTANTE: ReferenceHandler.IgnoreCycles
        // Evita el error de "Referencia Circular" cuando serializamos objetos relacionados.
        // Ejemplo: Doctor tiene Turnos -> Turno tiene Doctor -> Doctor tiene Turnos... (bucle infinito).
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Agregamos SignalR (para la funcionalidad en tiempo real de la pantalla de turnos)
builder.Services.AddSignalR();

// Configuración de CORS (Cross-Origin Resource Sharing)
// Permite que el navegador acepte peticiones desde un dominio/puerto distinto al de la API.
// Vital para que tu Frontend (ej: React en puerto 3000) hable con el Backend (puerto 5000).
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
            .AllowAnyOrigin()  // Permite cualquier origen (Cuidado en producción)
            .AllowAnyMethod()  // GET, POST, PUT, DELETE...
            .AllowAnyHeader());
});

// Configuración de Autenticación con JWT (JSON Web Token)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        // Definimos las reglas para validar que un token sea legítimo
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,             // ¿Quién emitió el token? (Tu API)
            ValidateAudience = true,           // ¿Para quién es el token?
            ValidateLifetime = true,           // ¿El token sigue vigente o expiró?
            ValidateIssuerSigningKey = true,   // ¿La firma coincide con nuestra clave secreta?

            // Leemos los valores secretos desde appsettings.json
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Configuración de Swagger (Documentación automática de la API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- FIN DE LA CONFIGURACIÓN DE SERVICIOS ---

// Construimos la aplicación
var app = builder.Build();

// --- BLOQUE DE SEEDING (Inicialización de Datos) ---
// Este bloque se ejecuta al arrancar la app.
// Verifica si la base de datos existe, aplica migraciones pendientes y crea datos iniciales.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TurneroDbContext>();
        context.Database.Migrate(); // Aplica 'Update-Database' automáticamente al iniciar

        // Creamos el usuario Admin si no existe
        var authService = services.GetRequiredService<AuthService>();
        authService.SeedAdminUser();

        // Creamos los Doctores y Horarios iniciales
        var doctorService = services.GetRequiredService<DoctorService>();
        await doctorService.SeedDoctors();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al sembrar (seeding) la base de datos.");
    }
}

// --- PIPELINE DE PETICIONES HTTP (Middleware) ---
// Aquí definimos el orden en que se procesan las peticiones que llegan.

// Si estamos en desarrollo, mostramos la interfaz visual de Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Redirección a HTTPS (comentado por ahora)

// Aplicamos la política de CORS definida arriba (debe ir antes de Auth)
app.UseCors("CorsPolicy");

// Activamos la autenticación (¿Quién eres?) y autorización (¿Qué puedes hacer?)
app.UseAuthentication();
app.UseAuthorization();

// Mapeamos los controladores (Endpoints de la API)
app.MapControllers();

// Mapeamos el Hub de SignalR a la ruta "/turnhub"
// El frontend se conectará a: http://localhost:xxxx/turnhub
app.MapHub<TurnHub>("/turnhub");

// Ejecutamos la aplicación
app.Run();