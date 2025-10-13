using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ItemEntradasController : ControllerBase
    {
        private readonly IItemEntradaService _service;

        public ItemEntradasController(IItemEntradaService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemEntrada>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemEntrada>> Get(int id)
        {
            var item = await _service.ObtenerPorIdAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpGet("por-notaentrada/{notaId}")]
        public async Task<ActionResult<IEnumerable<ItemEntrada>>> GetPorNotaEntrada(int notaId)
        {
            return await _service.ObtenerPorNotaEntradaIdAsync(notaId);
        }

        [HttpPost]
        public async Task<IActionResult> Post(ItemEntrada item)
        {
            await _service.CrearAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ItemEntrada item)
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
