using Dominio;
using Dominio.DTOs;
using Dominio.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Negocio.Interfaces;
using System.Security.Claims;

namespace Remitos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RemitosController : ControllerBase
    {
        private readonly IRemitoService _service;

        public RemitosController(IRemitoService service)
        {
            _service = service;
        }

        private string ObtenerUsuarioActual()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                username = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(username))
                username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return username ?? "SISTEMA";
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RemitoDto>>> Get()
        {
            var remitos = await _service.ObtenerTodosAsync();
            var remitosDto = remitos.Select(r => r.ToDto()).ToList();
            return Ok(remitosDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RemitoDto>> Get(int id)
        {
            var remito = await _service.ObtenerPorIdAsync(id);
            if (remito == null)
                return NotFound(new { mensaje = $"No se encontró el remito con ID {id}" });

            return Ok(remito.ToDto());
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RemitoDto remitoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var usuario = ObtenerUsuarioActual();
            var remito = remitoDto.ToEntity();

            await _service.CrearAsync(remito, usuario);

            var resultado = new RemitoDto
            {
                Id = remito.Id,
                Numero = remito.Numero,
                Fecha = remito.Fecha,
                Destino = remito.Destino,
                Items = remito.Items.Select(i => new ItemRemitoDto
                {
                    Id = i.Id,
                    IdRemito = i.id_remito,
                    NumeroItem = i.numero_item,
                    Descripcion = i.descripcion,
                    Serial = i.serial,
                    Usuario = i.usuario,
                    Cantidad = i.cantidad,
                    Detalle = i.detalle,
                    RecibidoPor = i.recibido_por
                }).ToList()
            };

            return CreatedAtAction(nameof(Get), new { id = remito.Id }, resultado);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] RemitoDto remitoDto)
        {
            if (id != remitoDto.Id)
                return BadRequest(new { mensaje = "El ID del remito no coincide" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var usuario = ObtenerUsuarioActual();
            var remito = remitoDto.ToEntity();

            try
            {
                await _service.ActualizarAsync(remito, usuario);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al actualizar", detalle = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var usuario = ObtenerUsuarioActual();

            try
            {
                await _service.EliminarAsync(id, usuario);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al eliminar", detalle = ex.Message });
            }
        }
    }
}