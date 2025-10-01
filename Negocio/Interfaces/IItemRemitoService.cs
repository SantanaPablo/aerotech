using Dominio;

namespace Negocio.Interfaces
{
    public interface IItemRemitoService
    {
        Task<List<ItemRemito>> ObtenerTodosAsync();
        Task<ItemRemito?> ObtenerPorIdAsync(int id);
        Task CrearAsync(ItemRemito item);
        Task ActualizarAsync(ItemRemito item);
        Task EliminarAsync(int id);
        Task<List<ItemRemito>> ObtenerPorRemitoIdAsync(int remitoId);
    }
}
