using Dominio;

namespace Negocio.Interfaces
{
    public interface IUsuarioService
    {
        Task<List<Usuario>> ObtenerTodosAsync();
        Task<Usuario?> ObtenerPorIdAsync(int id);
        Task CrearAsync(Usuario usuario);
        Task ActualizarAsync(Usuario usuario);
        Task EliminarAsync(int id);
        Task<Usuario?> ObtenerPorLegajoAsync(string legajo);
    }
}
