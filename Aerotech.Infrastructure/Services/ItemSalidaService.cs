using Aerotech.Domain;
using Microsoft.EntityFrameworkCore;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;

namespace Aerotech.Infrastructure.Services
{
    public class ItemSalidaService : IItemSalidaService
    {
        private readonly AppDbContext _context;

        public ItemSalidaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ItemSalida>> ObtenerTodosAsync()
        {
            return await _context.ItemsSalida
                .Include(i => i.NotaSalida)
                .ToListAsync();
        }

        public async Task<ItemSalida> ObtenerPorIdAsync(int id)
        {
            return await _context.ItemsSalida
                .Include(i => i.NotaSalida)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task CrearAsync(ItemSalida item)
        {
            _context.ItemsSalida.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(ItemSalida item)
        {
            _context.ItemsSalida.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var item = await _context.ItemsSalida.FindAsync(id);
            if (item != null)
            {
                _context.ItemsSalida.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ItemSalida>> ObtenerPorNotaSalidaIdAsync(int notaId)
        {
            return await _context.ItemsSalida
                .Where(i => i.NotaSalidaId == notaId)
                .ToListAsync();
        }
    }
}
