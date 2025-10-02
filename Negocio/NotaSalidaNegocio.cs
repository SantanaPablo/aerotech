using Dominio;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Negocio
{
    public class NotaSalidaNegocio : INotaSalidaService
    {
        private readonly AppDbContext _context;

        public NotaSalidaNegocio(AppDbContext context)
        {
            _context = context;
        }

        // ASÍNCRONO
        public async Task<List<NotaSalida>> ObtenerTodosAsync()
        {
            return await _context.NotasSalida
         .Include(n => n.Autorizante)
         .Include(n => n.Items) // 👈 ahora devuelve también los items
         .ToListAsync();

        }

        // ASÍNCRONO
        public async Task<NotaSalida> ObtenerPorIdAsync(int id)
        {
            return await _context.NotasSalida
                .Include(n => n.Autorizante)
                .Include(n => n.Items)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        // ASÍNCRONO
        public async Task CrearAsync(NotaSalida nota)
        {
            _context.NotasSalida.Add(nota);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task ActualizarAsync(NotaSalida nota)
        {
            _context.NotasSalida.Update(nota);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
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
