using Dominio;

namespace Negocio.Interfaces
{
    public interface IRemitoService
    {
        Task<List<Remito>> ObtenerTodosAsync();
        Task<Remito?> ObtenerPorIdAsync(int id);
        Task CrearAsync(Remito remito);
        Task ActualizarAsync(Remito remito);
        Task EliminarAsync(int id);
    }
}
