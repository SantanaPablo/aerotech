
using Dominio.DTOs;

namespace Dominio.Extensions
{
    public static class RemitoExtensions
    {
        public static RemitoDto ToDto(this Remito remito)
        {
            return new RemitoDto
            {
                Id = remito.Id,
                Numero = remito.Numero,
                Fecha = remito.Fecha,
                Destino = remito.Destino,
                Items = remito.Items.Select(i => new ItemRemitoDto
                {
                    Id = i.Id,
                    IdRemito = i.id_remito,
                    NumeroItem = i.numero_item,
                    Descripcion = i.descripcion,
                    Serial = i.serial,
                    Usuario = i.usuario,
                    Cantidad = i.cantidad,
                    Detalle = i.detalle,
                    RecibidoPor = i.recibido_por
                }).ToList()
            };
        }

        public static Remito ToEntity(this RemitoDto dto)
        {
            return new Remito
            {
                Id = dto.Id,
                Numero = dto.Numero,
                Fecha = dto.Fecha,
                Destino = dto.Destino,
                Items = dto.Items.Select(i => new ItemRemito
                {
                    Id = i.Id,
                    id_remito = i.IdRemito,
                    numero_item = i.NumeroItem,
                    descripcion = i.Descripcion,
                    serial = i.Serial,
                    usuario = i.Usuario,
                    cantidad = i.Cantidad ?? 1,
                    detalle = i.Detalle,
                    recibido_por = i.RecibidoPor
                }).ToList()
            };
        }
    }
}