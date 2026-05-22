using System.Text.Json;
using Aerotech.Domain;
using Aerotech.Application.Interfaces;
using Aerotech.Infrastructure.Persistence;

namespace Aerotech.Infrastructure.Services
{
    public class AuditoriaService : IAuditoriaService
    {
        private readonly AppDbContext _context;

        public AuditoriaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarAuditoriaRemito(
            int idRemito,
            string tipoOperacion,
            string usuario,
            object? datosAnteriores = null,
            object? datosNuevos = null)
        {
            var auditoria = new AuditoriaRemito
            {
                IdRemito = idRemito,
                TipoOperacion = tipoOperacion,
                UsuarioOperacion = usuario,
                FechaOperacion = DateTime.Now,
                DatosAnteriores = datosAnteriores != null ? JsonSerializer.Serialize(datosAnteriores) : null,
                DatosNuevos = datosNuevos != null ? JsonSerializer.Serialize(datosNuevos) : null
            };

            _context.AuditoriasRemito.Add(auditoria);
            await _context.SaveChangesAsync();
        }

        public async Task RegistrarAuditoriaItem(
            int idItem,
            int idRemito,
            string tipoOperacion,
            string usuario,
            object? datosAnteriores = null,
            object? datosNuevos = null)
        {
            var auditoria = new AuditoriaItemRemito
            {
                IdItem = idItem,
                IdRemito = idRemito,
                TipoOperacion = tipoOperacion,
                UsuarioOperacion = usuario,
                FechaOperacion = DateTime.Now,
                DatosAnteriores = datosAnteriores != null ? JsonSerializer.Serialize(datosAnteriores) : null,
                DatosNuevos = datosNuevos != null ? JsonSerializer.Serialize(datosNuevos) : null
            };

            _context.AuditoriasItemRemito.Add(auditoria);
            await _context.SaveChangesAsync();
        }
    }
}
