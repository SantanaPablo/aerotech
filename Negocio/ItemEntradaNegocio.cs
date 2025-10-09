using Dominio;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Negocio
{
    public class ItemEntradaNegocio : IItemEntradaService
    {
        private readonly AppDbContext _context;

        public ItemEntradaNegocio(AppDbContext context)
        {
            _context = context;
        }

        // ASÍNCRONO
        public async Task<List<ItemEntrada>> ObtenerTodosAsync()
        {
            return await _context.ItemsEntrada.Include(i => i.NotaEntrada).ToListAsync();
        }

        // ASÍNCRONO
        public async Task<ItemEntrada> ObtenerPorIdAsync(int id)
        {
            return await _context.ItemsEntrada.Include(i => i.NotaEntrada)
                                            .FirstOrDefaultAsync(i => i.Id == id);
        }

        // ASÍNCRONO
        public async Task CrearAsync(ItemEntrada item)
        {
            _context.ItemsEntrada.Add(item);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task ActualizarAsync(ItemEntrada item)
        {
            _context.ItemsEntrada.Update(item);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task EliminarAsync(int id)
        {
            var item = await _context.ItemsEntrada.FindAsync(id);
            if (item != null)
            {
                _context.ItemsEntrada.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        // ASÍNCRONO
        public async Task<List<ItemEntrada>> ObtenerPorNotaEntradaIdAsync(int notaId)
        {
            return await _context.ItemsEntrada
                .Where(i => i.NotaEntradaId == notaId)
                .ToListAsync();
        }
    }
}
