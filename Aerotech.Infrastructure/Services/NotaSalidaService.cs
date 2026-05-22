using Aerotech.Domain;
using Microsoft.EntityFrameworkCore;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;

namespace Aerotech.Infrastructure.Services
{
    public class NotaSalidaService : INotaSalidaService
    {
        private readonly AppDbContext _context;

        public NotaSalidaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<NotaSalida>> ObtenerTodosAsync()
        {
            return await _context.NotasSalida
                .Include(n => n.Autorizante)
                .Include(n => n.Items)
                .ToListAsync();
        }

        public async Task<NotaSalida> ObtenerPorIdAsync(int id)
        {
            return await _context.NotasSalida
                .Include(n => n.Autorizante)
                .Include(n => n.Items)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task CrearAsync(NotaSalida nota)
        {
            _context.NotasSalida.Add(nota);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(NotaSalida nota)
        {
            _context.NotasSalida.Update(nota);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var nota = await _context.NotasSalida.FindAsync(id);
            if (nota != null)
            {
                _context.NotasSalida.Remove(nota);
                await _context.SaveChangesAsync();
            }
        }
    }
}
