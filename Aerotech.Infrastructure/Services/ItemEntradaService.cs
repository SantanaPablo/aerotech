using Aerotech.Domain;
using Microsoft.EntityFrameworkCore;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;

namespace Aerotech.Infrastructure.Services
{
    public class ItemEntradaService : IItemEntradaService
    {
        private readonly AppDbContext _context;

        public ItemEntradaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ItemEntrada>> ObtenerTodosAsync()
        {
            return await _context.ItemsEntrada
                .Include(i => i.NotaEntrada)
                .ToListAsync();
        }

        public async Task<ItemEntrada> ObtenerPorIdAsync(int id)
        {
            return await _context.ItemsEntrada
                .Include(i => i.NotaEntrada)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task CrearAsync(ItemEntrada item)
        {
            _context.ItemsEntrada.Add(item);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(ItemEntrada item)
        {
            _context.ItemsEntrada.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var item = await _context.ItemsEntrada.FindAsync(id);
            if (item != null)
            {
                _context.ItemsEntrada.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ItemEntrada>> ObtenerPorNotaEntradaIdAsync(int notaId)
        {
            return await _context.ItemsEntrada
                .Where(i => i.NotaEntradaId == notaId)
                .ToListAsync();
        }
    }
}
