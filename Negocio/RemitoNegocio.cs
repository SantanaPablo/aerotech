using Dominio;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces; // nuevo proyecto de interfaces

namespace Negocio
{
    public class RemitoNegocio : IRemitoService
    {
        private readonly AppDbContext _context;

        public RemitoNegocio(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Remito>> ObtenerTodosAsync()
        {
            return await _context.Remitos.Include(r => r.Items).ToListAsync();
        }

        public async Task<Remito?> ObtenerPorIdAsync(int id)
        {
            return await _context.Remitos.Include(r => r.Items)
                                         .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task CrearAsync(Remito remito)
        {
            _context.Remitos.Add(remito);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(Remito remito)
        {
            // Cargar el remito actual con sus ítems desde la base
            var remitoExistente = await _context.Remitos
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == remito.Id);

            if (remitoExistente == null)
                throw new InvalidOperationException($"No se encontró el remito con ID {remito.Id}");

            // --- Actualizar campos del remito ---
            remitoExistente.Numero = remito.Numero;
            remitoExistente.Fecha = remito.Fecha;
            remitoExistente.Destino = remito.Destino;

            // --- Obtener listas de ítems ---
            var itemsActuales = remitoExistente.Items.ToList(); // los que están en BD
            var itemsNuevos = remito.Items.ToList();            // los que vienen del frontend

            // 1️⃣ Actualizar o mantener ítems existentes
            foreach (var itemNuevo in itemsNuevos)
            {
                var existente = itemsActuales.FirstOrDefault(i => i.Id == itemNuevo.Id);
                if (existente != null)
                {
                    // Actualizar campos
                    existente.numero_item = itemNuevo.numero_item;
                    existente.descripcion = itemNuevo.descripcion;
                    existente.serial = itemNuevo.serial;
                    existente.usuario = itemNuevo.usuario;
                    existente.cantidad = itemNuevo.cantidad;
                    existente.detalle = itemNuevo.detalle;
                    existente.recibido_por = itemNuevo.recibido_por;
                }
                else
                {
                    // Nuevo ítem
                    itemNuevo.Id = 0; // asegurar que EF lo trate como nuevo
                    itemNuevo.id_remito = remitoExistente.Id;
                    _context.ItemsRemito.Add(itemNuevo);
                }
            }

        
            var idsNuevos = itemsNuevos.Where(i => i.Id > 0).Select(i => i.Id).ToList();
            var paraEliminar = itemsActuales
                .Where(i => !idsNuevos.Contains(i.Id))
                .ToList();

            if (paraEliminar.Any())
                _context.ItemsRemito.RemoveRange(paraEliminar);

 
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var remito = await _context.Remitos.FindAsync(id);
            if (remito != null)
            {
                _context.Remitos.Remove(remito);
                await _context.SaveChangesAsync();
            }
        }
    }
}
