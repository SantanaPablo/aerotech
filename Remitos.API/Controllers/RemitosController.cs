using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class RemitosController : ControllerBase
    {
        private readonly IRemitoService _service;

        public RemitosController(IRemitoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Remito>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Remito>> Get(int id)
        {
            var remito = await _service.ObtenerPorIdAsync(id);
            if (remito == null) return NotFound();
            return remito;
        }

        [HttpPost]
        public async Task<IActionResult> Post(Remito remito)
        {
            await _service.CrearAsync(remito);
            return CreatedAtAction(nameof(Get), new { id = remito.Id }, remito);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Remito remito)
        {
            if (id != remito.Id) return BadRequest();
            await _service.ActualizarAsync(remito);
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
