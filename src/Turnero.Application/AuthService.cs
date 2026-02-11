using System.Security.Cryptography;
using System.Text;
using Turnero.Core;
using Turnero.Infrastructure;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace Turnero.Application;

/// <summary>
/// Servicio encargado de la Autenticación (Login) y Seguridad.
/// Gestiona la validación de usuarios y la generación de Tokens JWT.
/// </summary>
public class AuthService
{
    private readonly TurneroDbContext _context;
    private readonly IConfiguration _configuration;

    // Constructor: Inyección de dependencias
    // _context: Para acceder a la base de datos de usuarios.
    // _configuration: Para leer el archivo appsettings.json (donde está la clave secreta del JWT).
    public AuthService(TurneroDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>
    /// Intenta iniciar sesión. Si es exitoso, devuelve un Token JWT string.
    /// Si falla, devuelve null.
    /// </summary>
    public string Login(LoginDto loginDto)
    {
        // 1. Buscamos el usuario en la base de datos por su Username.
        var user = _context.Users.SingleOrDefault(u => u.Username == loginDto.Username);

        // 2. Validación:
        // - Si el usuario es null (no existe).
        // - O si la contraseña enviada (hasheada) no coincide con la guardada.
        if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
        {
            return null; // Credenciales inválidas
        }

        // 3. Inicio de la construcción del Token JWT.
        // El handler es la clase que se encarga de crear y escribir el token.
        var tokenHandler = new JwtSecurityTokenHandler();

        // Obtenemos la "Secret Key" desde appsettings.json y la convertimos a bytes.
        // Esta clave es CRÍTICA: sirve para firmar el token. Si alguien la tiene, puede falsificar identidad.
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

        // 4. Configuración del Token (Descriptor).
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // Subject: Define los "Claims" (datos) que irán encriptados dentro del token.
            // Cuando el frontend nos envíe este token de vuelta, podremos leer estos datos.
            Subject = new ClaimsIdentity(new Claim[]
            {
                // Guardamos el ID del usuario en el claim "Name".
                new Claim(ClaimTypes.Name, user.Id.ToString()),
                // Guardamos el Rol (Admin/User) para saber qué permisos tiene.
                new Claim(ClaimTypes.Role, user.Role.ToString())
            }),

            // Expiración: El token será válido por 7 días. Después, el usuario debe loguearse de nuevo.
            Expires = DateTime.UtcNow.AddDays(7),

            // Firma Digital: Usamos la clave secreta y el algoritmo HMAC-SHA256.
            // Esto garantiza que el token no ha sido modificado por un hacker en el camino.
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        // 5. Generación final del string del token.
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Crea un usuario Administrador por defecto si no existe.
    /// Útil para el primer despliegue o entornos de desarrollo.
    /// </summary>
    public void SeedAdminUser()
    {
        if (!_context.Users.Any(u => u.Username == "admin"))
        {
            var adminUser = new User
            {
                Username = "admin",
                // IMPORTANTE: Nunca guardamos la contraseña plana. La pasamos por HashPassword.
                PasswordHash = HashPassword("login"),
                Role = UserRole.Admin
            };
            _context.Users.Add(adminUser);
            _context.SaveChanges();
        }

        // Llamamos al método para crear los usuarios doctores también.
        SeedDoctorUsers();
    }

    /// <summary>
    /// Crea usuarios de prueba para los doctores (Hardcodeado para demo).
    /// </summary>
    public void SeedDoctorUsers()
    {
        var doctorUsernames = new[]
        {
            "zurita", "lopez", "favaloro", "grierson", "laureano",
            "mistral", "favaloro2", "lanteri", "mallo", "moreau",
            "mazza", "carrillo", "rawson", "houssay", "eyle",
            "agote", "argerich"
        };

        foreach (var username in doctorUsernames)
        {
            if (!_context.Users.Any(u => u.Username == username))
            {
                var doctorUser = new User
                {
                    Username = username,
                    // Para este ejemplo, la contraseña es igual al nombre de usuario.
                    PasswordHash = HashPassword(username),
                    Role = UserRole.User
                };
                _context.Users.Add(doctorUser);
            }
        }

        _context.SaveChanges();
    }

    /// <summary>
    /// Convierte un texto plano (contraseña) en una cadena HASH usando SHA256.
    /// </summary>
    /// <remarks>
    /// Nota Educativa: SHA256 es un algoritmo "de una sola vía". 
    /// No se puede obtener la contraseña original a partir del hash.
    /// </remarks>
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            // Convertimos el string a bytes y calculamos el hash
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            // Convertimos los bytes resultantes a Base64 para guardarlo como texto en la BD
            return Convert.ToBase64String(hashedBytes);
        }
    }

    /// <summary>
    /// Verifica si una contraseña ingresada coincide con el hash guardado en la BD.
    /// </summary>
    private bool VerifyPassword(string password, string passwordHash)
    {
        // Para verificar, hasheamos la contraseña que ingresó el usuario
        // y comparamos si el resultado es idéntico al que tenemos guardado.
        return HashPassword(password) == passwordHash;
    }
}