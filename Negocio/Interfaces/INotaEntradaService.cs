using Dominio;

namespace Negocio.Interfaces
{
    public interface INotaEntradaService
    {
        Task<List<NotaEntrada>> ObtenerTodosAsync();
        Task<NotaEntrada?> ObtenerPorIdAsync(int id);
        Task CrearAsync(NotaEntrada nota);
        Task ActualizarAsync(NotaEntrada nota);
        Task EliminarAsync(int id);
    }
}
