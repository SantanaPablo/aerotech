using Aerotech.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;
using Remitos.API.Request;
using Microsoft.EntityFrameworkCore;

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
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Legajo == request.Legajo
                                       && u.Contrasena == request.Contrasena);

            if (user == null)
                return Unauthorized("Usuario o contraseña incorrectos");

            var token = JwtHelper.GenerateJwtToken(
                user.Id, user.Nombre, user.Legajo, user.Rol.Nombre, _config["Jwt:Key"]);

            return Ok(new { token, rol = user.Rol.Nombre });
        }
    }

    
}
