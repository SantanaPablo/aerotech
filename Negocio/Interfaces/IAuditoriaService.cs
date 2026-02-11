namespace Negocio.Interfaces
{
    public interface IAuditoriaService
    {
        Task RegistrarAuditoriaRemito(int idRemito, string tipoOperacion, string usuario, object? datosAnteriores = null, object? datosNuevos = null);
        Task RegistrarAuditoriaItem(int idItem, int idRemito, string tipoOperacion, string usuario, object? datosAnteriores = null, object? datosNuevos = null);
    }
}