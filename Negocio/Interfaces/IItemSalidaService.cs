using Dominio;

namespace Negocio.Interfaces
{
    public interface IItemSalidaService
    {
        Task<List<ItemSalida>> ObtenerTodosAsync();
        Task<ItemSalida?> ObtenerPorIdAsync(int id);
        Task CrearAsync(ItemSalida item);
        Task ActualizarAsync(ItemSalida item);
        Task EliminarAsync(int id);
        Task<List<ItemSalida>> ObtenerPorNotaSalidaIdAsync(int notaId);
    }
}
