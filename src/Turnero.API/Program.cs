using Turnero.API.Hubs;
using Turnero.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using Turnero.Application; 
using Turnero.Application.Services; // Para DoctorService

// 1. CREACIÓN DEL BUILDER
// Inicializa la aplicación web y carga la configuración (appsettings.json, variables de entorno, etc.)
var builder = WebApplication.CreateBuilder(args);

// --- ZONA DE INYECCIÓN DE DEPENDENCIAS (DI) ---
// Aquí registramos todas las clases que nuestra app necesita para funcionar.

// --- CONFIGURACIÓN DE LA BASE DE DATOS (EF Core) ---
// Acá le decimos a la aplicación que use SQL Server.
// IMPORTANTE: Ya no harcodeamos la Connection String acá por seguridad (el profe nos mata si ve passwords en el código).
// Ahora la tomamos de la configuración (appsettings.json o User Secrets en desarrollo).
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Validamos que exista la cadena de conexión, si no, que explote con un mensaje claro para no perder tiempo debuggeando.
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("¡ERROR CRÍTICO! No se encontró la cadena de conexión 'DefaultConnection'. Asegúrate de haber configurado los User Secrets o el appsettings.json correctamente.");
}

builder.Services.AddDbContext<TurneroDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- REGISTRO DE SERVICIOS PROPIOS (Lógica de Negocio) ---
// Usamos AddScoped porque queremos que se cree una instancia nueva por cada petición HTTP.
// Es lo estándar para servicios que interactúan con la base de datos (DbContext también es Scoped).
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TurnService>();
builder.Services.AddScoped<DoctorService>();

// --- CONFIGURACIÓN DE CORs ---
// Esto es vital para que el frontend (React/Next.js en otro puerto/dominio) pueda hablar con este backend.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
            .AllowAnyOrigin()  // OJO: En producción esto debería ser más restrictivo por seguridad.
            .AllowAnyMethod()  // GET, POST, PUT, DELETE, etc.
            .AllowAnyHeader());
});

// --- CONFIGURACIÓN DE AUTENTICACIÓN (JWT) ---
// Configuración para usar JSON Web Tokens (JWT) para loguearnos de forma segura.
var jwtKey = builder.Configuration["Jwt:Key"];

// Otra validación para no volvernos locos si el token falla por esto.
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("¡ERROR CRÍTICO! No se encontró la clave secreta 'Jwt:Key'. Configurala en los User Secrets para que ande el login.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        // Usamos la clave que recuperamos de forma segura de la configuración
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Configuración de Controladores y JSON
// Ignoramos ciclos en JSON para que no explote si tenemos referencias circulares (A tiene B, B tiene A).
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Agregamos SignalR (para la funcionalidad en tiempo real, tipo chat o notificaciones)
builder.Services.AddSignalR();

// Configuración de Swagger (Documentación automática de la API)
// Esto genera una web donde podemos ver y probar los endpoints.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- CONSTRUCCIÓN DE LA APP ---
var app = builder.Build();

// --- 2. PIPELINE DE MIDDLEWARE (Cómo se procesan las peticiones) ---

// Seeding de datos (Inicialización de la Base de Datos)
// Esto se ejecuta CADA VEZ que arranca la app para asegurar que la DB esté al día y tenga el usuario admin.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TurneroDbContext>();
        context.Database.Migrate(); // Aplica migrations pendientes (como 'Update-Database' pero automático)

        var authService = services.GetRequiredService<AuthService>();
        authService.SeedAdminUser(); // Crea al admin si no existe

        // Si hubiera más seeders, irían acá
        // var doctorService = services.GetRequiredService<DoctorService>();
        // doctorService.Seed...
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al sembrar (seeding) la base de datos.");
    }
}

// Swagger en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Comentado por ahora para evitar lios con certificados locales

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Mapeamos el Hub de SignalR
app.MapHub<TurnHub>("/turnhub");

// ¡A correr!
app.Run();