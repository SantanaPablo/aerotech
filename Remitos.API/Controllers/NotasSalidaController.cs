using Aerotech.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Aerotech.Application.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin, Tecnico")]
    public class NotasSalidaController : ControllerBase
    {
        private readonly INotaSalidaService _service;

        public NotasSalidaController(INotaSalidaService service)
        {
            _service = service;
        }

        private int ObtenerUsuarioId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        private bool EsAdmin() => User.IsInRole("Admin");

        // Admin: ve todas con columna de estado.
        // Tecnico: ve las aprobadas (Recibido=true) + las propias pendientes (AutorizanteId == suyo).
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaSalida>>> Get()
        {
            var todas = await _service.ObtenerTodosAsync();

            if (EsAdmin())
                return Ok(todas);

            var userId = ObtenerUsuarioId();
            var filtradas = todas
                .Where(n => n.Recibido || n.AutorizanteId == userId)
                .ToList();

            return Ok(filtradas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotaSalida>> Get(int id)
        {
            var nota = await _service.ObtenerPorIdAsync(id);
            if (nota == null) return NotFound();

            if (!EsAdmin())
            {
                var userId = ObtenerUsuarioId();
                if (!nota.Recibido && nota.AutorizanteId != userId)
                    return Forbid();
            }

            return Ok(nota);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] NotaSalida nota)
        {
            if (EsAdmin())
            {
                // Admin crea aprobada por defecto; puede cambiarlo desde el form
                if (!nota.Recibido)
                    nota.Recibido = true;
            }
            else
            {
                // Tecnico: siempre pendiente, el backend lo fuerza
                // AutorizanteId ya viene seteado desde el frontend con su propio ID
                nota.Recibido = false;
            }

            await _service.CrearAsync(nota);
            return CreatedAtAction(nameof(Get), new { id = nota.Id }, nota);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] NotaSalida nota)
        {
            if (id != nota.Id) return BadRequest();
            await _service.ActualizarAsync(nota);
            return NoContent();
        }

        // El admin aprueba: Recibido=true y pasa a ser el autorizante real
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/aprobar")]
        public async Task<IActionResult> Aprobar(int id)
        {
            var nota = await _service.ObtenerPorIdAsync(id);
            if (nota == null) return NotFound();

            nota.Recibido = true;
            nota.AutorizanteId = ObtenerUsuarioId();

            await _service.ActualizarAsync(nota);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.EliminarAsync(id);
            return NoContent();
        }
    }
}