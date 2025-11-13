using Microsoft.AspNetCore.Mvc;
using Turnero.Application;

namespace Turnero.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDto loginDto)
    {
        var token = _authService.Login(loginDto);

        if (token == null)
        {
            return Unauthorized();
        }

        return Ok(new { Token = token });
    }
}
