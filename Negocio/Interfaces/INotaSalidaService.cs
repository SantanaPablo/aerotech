using Dominio;

namespace Negocio.Interfaces
{
    public interface INotaSalidaService
    {
        Task<List<NotaSalida>> ObtenerTodosAsync();
        Task<NotaSalida?> ObtenerPorIdAsync(int id);
        Task CrearAsync(NotaSalida nota);
        Task ActualizarAsync(NotaSalida nota);
        Task EliminarAsync(int id);
    }
}
