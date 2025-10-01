using System.Collections.Generic;
using System.Linq;
using Dominio;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using Negocio.Interfaces;

namespace Negocio
{
    public class ItemRemitoNegocio : IItemRemitoService
    {
        private readonly AppDbContext _context;

        public ItemRemitoNegocio(AppDbContext context)
        {
            _context = context;
        }

        // ASÍNCRONO
        public async Task<List<ItemRemito>> ObtenerTodosAsync()
        {
            // Se usa ToListAsync()
            return await _context.ItemsRemito.Include(i => i.Remito).ToListAsync();
        }

        // ASÍNCRONO
        public async Task<ItemRemito> ObtenerPorIdAsync(int id)
        {
            // Se usa FirstOrDefaultAsync()
            return await _context.ItemsRemito.Include(i => i.Remito)
                                            .FirstOrDefaultAsync(i => i.Id == id);
        }

        // ASÍNCRONO
        public async Task CrearAsync(ItemRemito item)
        {
            _context.ItemsRemito.Add(item);
            // Se usa SaveChangesAsync()
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task ActualizarAsync(ItemRemito item)
        {
            _context.ItemsRemito.Update(item);
            // Se usa SaveChangesAsync()
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task EliminarAsync(int id)
        {
            // Se usa FindAsync() o una consulta asíncrona
            var item = await _context.ItemsRemito.FindAsync(id);
            if (item != null)
            {
                _context.ItemsRemito.Remove(item);
                // Se usa SaveChangesAsync()
                await _context.SaveChangesAsync();
            }
        }

        // ASÍNCRONO
        public async Task<List<ItemRemito>> ObtenerPorRemitoIdAsync(int remitoId)
        {
            // Se usa ToListAsync()
            return await _context.ItemsRemito
                .Where(i => i.id_remito == remitoId)
                .ToListAsync();
        }
    }
}
