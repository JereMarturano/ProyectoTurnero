using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Turnero.Application;
using Turnero.API.Hubs;
using Turnero.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<TurneroDbContext>(options =>
    options.UseInMemoryDatabase("TurneroDb"));

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TurnService>();

builder.Services.AddControllers();
builder.Services.AddSignalR();

// 👇 INICIO DE LA CONFIGURACIÓN DE CORS
// Define un nombre para la política de CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("http://localhost:3000") // La URL de tu React
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials(); // <-- MUY IMPORTANTE para SignalR
                      });
});
// 👆 FIN DE LA CONFIGURACIÓN DE CORS


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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var authService = services.GetRequiredService<AuthService>();
    authService.SeedAdminUser();
}

// Configure the HTTP request pipeline.
if (app.Environment..IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// 👇 INICIO DE USO DE CORS
// !! IMPORTANTE: Llama a UseCors() ANTES de UseAuthorization()
app.UseCors(MyAllowSpecificOrigins);
// 👆 FIN DE USO DE CORS

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TurnHub>("/turnhub");

app.Run();
