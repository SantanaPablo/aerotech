using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin, Tecnico")]
    public class NotasEntradaController : ControllerBase
    {
        private readonly INotaEntradaService _service;

        public NotasEntradaController(INotaEntradaService service)
        {
            _service = service;
        }
        [Authorize(Roles = "Admin, Tecnico")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaEntrada>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }
        [Authorize(Roles = "Admin, Tecnico")]
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaEntrada>> Get(int id)
        {
            var nota = await _service.ObtenerPorIdAsync(id);
            if (nota == null) return NotFound();
            return nota;
        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post(NotaEntrada nota)
        {
            await _service.CrearAsync(nota);
            return CreatedAtAction(nameof(Get), new { id = nota.Id }, nota);
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, NotaEntrada nota)
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
