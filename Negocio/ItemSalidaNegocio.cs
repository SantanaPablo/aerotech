using Dominio;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Negocio
{
    public class ItemSalidaNegocio : IItemSalidaService
    {
        private readonly AppDbContext _context;

        public ItemSalidaNegocio(AppDbContext context)
        {
            _context = context;
        }

        // ASÍNCRONO
        public async Task<List<ItemSalida>> ObtenerTodosAsync()
        {
            return await _context.ItemsSalida.Include(i => i.NotaSalida).ToListAsync();
        }

        // ASÍNCRONO
        public async Task<ItemSalida> ObtenerPorIdAsync(int id)
        {
            return await _context.ItemsSalida.Include(i => i.NotaSalida)
                                            .FirstOrDefaultAsync(i => i.Id == id);
        }

        // ASÍNCRONO
        public async Task CrearAsync(ItemSalida item)
        {
            _context.ItemsSalida.Add(item);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task ActualizarAsync(ItemSalida item)
        {
            _context.ItemsSalida.Update(item);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task EliminarAsync(int id)
        {
            var item = await _context.ItemsSalida.FindAsync(id);
            if (item != null)
            {
                _context.ItemsSalida.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        // ASÍNCRONO
        public async Task<List<ItemSalida>> ObtenerPorNotaSalidaIdAsync(int notaId)
        {
            return await _context.ItemsSalida
                .Where(i => i.NotaSalidaId == notaId)
                .ToListAsync();
        }
    }
}
