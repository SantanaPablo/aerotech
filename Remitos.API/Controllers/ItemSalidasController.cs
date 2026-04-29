using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ItemSalidasController : ControllerBase
    {
        private readonly IItemSalidaService _service;

        public ItemSalidasController(IItemSalidaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemSalida>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemSalida>> Get(int id)
        {
            var item = await _service.ObtenerPorIdAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpGet("por-notasalida/{notaId}")]
        public async Task<ActionResult<IEnumerable<ItemSalida>>> GetPorNotaSalida(int notaId)
        {
            return await _service.ObtenerPorNotaSalidaIdAsync(notaId);
        }

        [HttpPost]
        public async Task<IActionResult> Post(ItemSalida item)
        {
            await _service.CrearAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ItemSalida item)
        {
            if (id != item.Id) return BadRequest();
            await _service.ActualizarAsync(item);
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
