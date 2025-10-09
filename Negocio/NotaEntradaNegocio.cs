using Dominio;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Negocio
{
    public class NotaEntradaNegocio : INotaEntradaService
    {
        private readonly AppDbContext _context;

        public NotaEntradaNegocio(AppDbContext context)
        {
            _context = context;
        }

        // ASÍNCRONO
        public async Task<List<NotaEntrada>> ObtenerTodosAsync()
        {
            return await _context.NotasEntrada
         .Include(n => n.Autorizante)
         .Include(n => n.Items) // 👈 ahora devuelve también los items
         .ToListAsync();

        }

        // ASÍNCRONO
        public async Task<NotaEntrada> ObtenerPorIdAsync(int id)
        {
            return await _context.NotasEntrada
                .Include(n => n.Autorizante)
                .Include(n => n.Items)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        // ASÍNCRONO
        public async Task CrearAsync(NotaEntrada nota)
        {
            _context.NotasEntrada.Add(nota);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task ActualizarAsync(NotaEntrada nota)
        {
            _context.NotasEntrada.Update(nota);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
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
