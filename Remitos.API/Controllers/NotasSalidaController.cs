using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotasSalidaController : ControllerBase
    {
        private readonly INotaSalidaService _service;

        public NotasSalidaController(INotaSalidaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaSalida>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotaSalida>> Get(int id)
        {
            var nota = await _service.ObtenerPorIdAsync(id);
            if (nota == null) return NotFound();
            return nota;
        }

        [HttpPost]
        public async Task<IActionResult> Post(NotaSalida nota)
        {
            await _service.CrearAsync(nota);
            return CreatedAtAction(nameof(Get), new { id = nota.Id }, nota);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, NotaSalida nota)
        {
            if (id != nota.Id) return BadRequest();
            await _service.ActualizarAsync(nota);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.EliminarAsync(id);
            return NoContent();
        }
    }
}
