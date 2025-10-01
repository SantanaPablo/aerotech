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
            _context.Remitos.Update(remito);
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
