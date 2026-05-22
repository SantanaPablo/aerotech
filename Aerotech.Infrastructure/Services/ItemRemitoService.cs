using Aerotech.Domain;
using Microsoft.EntityFrameworkCore;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;

namespace Aerotech.Infrastructure.Services
{
    public class ItemRemitoService : IItemRemitoService
    {
        private readonly AppDbContext _context;

        public ItemRemitoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ItemRemito>> ObtenerTodosAsync()
        {
            return await _context.ItemsRemito
                .Include(i => i.Remito)
                .ToListAsync();
        }

        public async Task<ItemRemito> ObtenerPorIdAsync(int id)
        {
            return await _context.ItemsRemito
                .Include(i => i.Remito)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task CrearAsync(ItemRemito item)
        {
            _context.ItemsRemito.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(ItemRemito item)
        {
            _context.ItemsRemito.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var item = await _context.ItemsRemito.FindAsync(id);
            if (item != null)
            {
                _context.ItemsRemito.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ItemRemito>> ObtenerPorRemitoIdAsync(int remitoId)
        {
            return await _context.ItemsRemito
                .Where(i => i.id_remito == remitoId)
                .ToListAsync();
        }
    }
}
