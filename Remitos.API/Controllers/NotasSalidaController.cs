using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

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
        [Authorize(Roles = "Admin, Tecnico")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaSalida>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }
        [Authorize(Roles = "Admin, Tecnico")]
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaSalida>> Get(int id)
        {
            var nota = await _service.ObtenerPorIdAsync(id);
            if (nota == null) return NotFound();
            return nota;
        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post(NotaSalida nota)
        {
            await _service.CrearAsync(nota);
            return CreatedAtAction(nameof(Get), new { id = nota.Id }, nota);
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, NotaSalida nota)
        {
            if (id != nota.Id) return BadRequest();
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
