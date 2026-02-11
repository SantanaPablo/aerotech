using Dominio;

namespace Negocio.Interfaces
{
    public interface IRemitoService
    {
        Task<List<Remito>> ObtenerTodosAsync();
        Task<Remito?> ObtenerPorIdAsync(int id);
        Task CrearAsync(Remito remito, string usuario);
        Task ActualizarAsync(Remito remito, string usuario);
        Task EliminarAsync(int id, string usuario);
    }
}
