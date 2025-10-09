using Dominio;

namespace Negocio.Interfaces
{
    public interface IItemEntradaService
    {
        Task<List<ItemEntrada>> ObtenerTodosAsync();
        Task<ItemEntrada?> ObtenerPorIdAsync(int id);
        Task CrearAsync(ItemEntrada item);
        Task ActualizarAsync(ItemEntrada item);
        Task EliminarAsync(int id);
        Task<List<ItemEntrada>> ObtenerPorNotaEntradaIdAsync(int notaId);
    }
}
