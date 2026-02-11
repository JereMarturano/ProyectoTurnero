using Microsoft.AspNetCore.Mvc;
using Turnero.Application;

namespace Turnero.API.Controllers;

// [ApiController]: Le dice a .NET que esta clase sirve respuestas API (JSON) 
// y habilita validaciones automáticas del modelo.
[ApiController]
// [Route]: Define la URL base. "[controller]" se reemplaza por el nombre de la clase 
// menos la palabra "Controller". Osea: /api/Auth
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    // Constructor: Inyectamos el AuthService para poder usar su lógica de login.
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // Endpoint: POST /api/Auth/login
    // [FromBody]: Indica que los datos (usuario y contraseña) vienen en el cuerpo del JSON, no en la URL.
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        // 1. Llamamos al servicio para intentar loguearnos
        var token = _authService.Login(loginDto);

        // 2. Si el servicio devuelve null, significa que el usuario o contraseña están mal.
        // Devolvemos un código HTTP 401 (Unauthorized).
        if (token == null)
        {
            return Unauthorized();
        }

        // 3. Si hay token, devolvemos un código HTTP 200 (OK)
        // y enviamos el token dentro de un objeto JSON anónimo.
        return Ok(new { Token = token });
    }
}