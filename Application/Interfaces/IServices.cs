using Aerotech.Domain;

namespace Aerotech.Application.Interfaces { 
    public interface IAuditoriaService
    {
        Task RegistrarAuditoriaRemito(
            int idRemito,
            string tipoOperacion,
            string usuario,
            object? datosAnteriores = null,
            object? datosNuevos = null);

        Task RegistrarAuditoriaItem(
            int idItem,
            int idRemito,
            string tipoOperacion,
            string usuario,
            object? datosAnteriores = null,
            object? datosNuevos = null);
    }

    public interface IRemitoService
    {
        Task<List<Remito>> ObtenerTodosAsync();
        Task<Remito?> ObtenerPorIdAsync(int id);
        Task CrearAsync(Remito remito, string usuario);
        Task ActualizarAsync(Remito remito, string usuario);
        Task EliminarAsync(int id, string usuario);
    }

    public interface IItemRemitoService
    {
        Task<List<ItemRemito>> ObtenerTodosAsync();
        Task<ItemRemito> ObtenerPorIdAsync(int id);
        Task CrearAsync(ItemRemito item);
        Task ActualizarAsync(ItemRemito item);
        Task EliminarAsync(int id);
        Task<List<ItemRemito>> ObtenerPorRemitoIdAsync(int remitoId);
    }

    public interface INotaSalidaService
    {
        Task<List<NotaSalida>> ObtenerTodosAsync();
        Task<NotaSalida> ObtenerPorIdAsync(int id);
        Task CrearAsync(NotaSalida nota);
        Task ActualizarAsync(NotaSalida nota);
        Task EliminarAsync(int id);
    }

    public interface IItemSalidaService
    {
        Task<List<ItemSalida>> ObtenerTodosAsync();
        Task<ItemSalida> ObtenerPorIdAsync(int id);
        Task CrearAsync(ItemSalida item);
        Task ActualizarAsync(ItemSalida item);
        Task EliminarAsync(int id);
        Task<List<ItemSalida>> ObtenerPorNotaSalidaIdAsync(int notaId);
    }

    public interface INotaEntradaService
    {
        Task<List<NotaEntrada>> ObtenerTodosAsync();
        Task<NotaEntrada> ObtenerPorIdAsync(int id);
        Task CrearAsync(NotaEntrada nota);
        Task ActualizarAsync(NotaEntrada nota);
        Task EliminarAsync(int id);
    }

    public interface IItemEntradaService
    {
        Task<List<ItemEntrada>> ObtenerTodosAsync();
        Task<ItemEntrada> ObtenerPorIdAsync(int id);
        Task CrearAsync(ItemEntrada item);
        Task ActualizarAsync(ItemEntrada item);
        Task EliminarAsync(int id);
        Task<List<ItemEntrada>> ObtenerPorNotaEntradaIdAsync(int notaId);
    }

    public interface IUsuarioService
    {
        Task<List<Usuario>> ObtenerTodosAsync();
        Task<Usuario> ObtenerPorIdAsync(int id);
        Task CrearAsync(Usuario usuario);
        Task ActualizarAsync(Usuario usuario);
        Task EliminarAsync(int id);
        Task<Usuario> ObtenerPorLegajoAsync(string legajo);
    }
}
