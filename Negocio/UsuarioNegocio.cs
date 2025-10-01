using Dominio;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces;

namespace Negocio
{
    public class UsuarioNegocio : IUsuarioService
    {
        private readonly AppDbContext _context;

        public UsuarioNegocio(AppDbContext context)
        {
            _context = context;
        }

        // ASÍNCRONO
        public async Task<List<Usuario>> ObtenerTodosAsync()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // ASÍNCRONO
        public async Task<Usuario> ObtenerPorIdAsync(int id)
        {
            return await _context.Usuarios.FindAsync(id);
        }

        // ASÍNCRONO
        public async Task CrearAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task ActualizarAsync(Usuario usuario)
        {
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
        }

        // ASÍNCRONO
        public async Task EliminarAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario != null)
            {
                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();
            }
        }

        // ASÍNCRONO
        public async Task<Usuario> ObtenerPorLegajoAsync(string legajo)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Legajo == legajo);
        }
    }
}
