using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Negocio;
using Remitos.API.Request;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Legajo == request.Legajo && u.Contrasena == request.Contrasena);

            if (user == null)
                return Unauthorized("Usuario o contraseña incorrectos");

            var token = JwtHelper.GenerateJwtToken(
                user.Id,
                user.Nombre,
                user.Legajo,
                "Usuario",
                _config["Jwt:Key"]
            );

            return Ok(new { token });
        }
    }

    
}
