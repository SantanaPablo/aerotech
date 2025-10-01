using Dominio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class ItemRemitosController : ControllerBase
    {
        private readonly IItemRemitoService _service;

        public ItemRemitosController(IItemRemitoService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemRemito>>> Get()
        {
            return await _service.ObtenerTodosAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemRemito>> Get(int id)
        {
            var item = await _service.ObtenerPorIdAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpGet("por-remito/{remitoId}")]
        public async Task<ActionResult<IEnumerable<ItemRemito>>> GetPorRemito(int remitoId)
        {
            return await _service.ObtenerPorRemitoIdAsync(remitoId);
        }

        [HttpPost]
        public async Task<IActionResult> Post(ItemRemito item)
        {
            await _service.CrearAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ItemRemito item)
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
