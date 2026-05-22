using Aerotech.Domain;
using Microsoft.EntityFrameworkCore;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;

namespace Aerotech.Infrastructure.Services
{
    public class NotaEntradaService : INotaEntradaService
    {
        private readonly AppDbContext _context;

        public NotaEntradaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<NotaEntrada>> ObtenerTodosAsync()
        {
            return await _context.NotasEntrada
                .Include(n => n.Autorizante)
                .Include(n => n.Items)
                .ToListAsync();
        }

        public async Task<NotaEntrada> ObtenerPorIdAsync(int id)
        {
            return await _context.NotasEntrada
                .Include(n => n.Autorizante)
                .Include(n => n.Items)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task CrearAsync(NotaEntrada nota)
        {
            _context.NotasEntrada.Add(nota);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(NotaEntrada nota)
        {
            _context.NotasEntrada.Update(nota);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id)
        {
            var nota = await _context.NotasEntrada.FindAsync(id);
            if (nota != null)
            {
                _context.NotasEntrada.Remove(nota);
                await _context.SaveChangesAsync();
            }
        }
    }
}
