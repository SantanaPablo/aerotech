using Dominio;
using Microsoft.EntityFrameworkCore;
using Negocio.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Negocio
{
    public class RemitoNegocio : IRemitoService
    {
        private readonly AppDbContext _context;
        private readonly IAuditoriaService _auditoriaService;

        public RemitoNegocio(AppDbContext context, IAuditoriaService auditoriaService)
        {
            _context = context;
            _auditoriaService = auditoriaService;
        }

        public async Task<List<Remito>> ObtenerTodosAsync()
        {
            return await _context.Remitos.Include(r => r.Items).ToListAsync();
        }

        public async Task<Remito?> ObtenerPorIdAsync(int id)
        {
            return await _context.Remitos.Include(r => r.Items)
                                         .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task CrearAsync(Remito remito, string usuario)
        {
            _context.Remitos.Add(remito);
            await _context.SaveChangesAsync();

            await _auditoriaService.RegistrarAuditoriaRemito(
                remito.Id,
                "INSERT",
                usuario,
                null,
                new { remito.Numero, remito.Fecha, remito.Destino }
            );

            foreach (var item in remito.Items)
            {
                await _auditoriaService.RegistrarAuditoriaItem(
                    item.Id,
                    remito.Id,
                    "INSERT",
                    usuario,
                    null,
                    new
                    {
                        item.numero_item,
                        item.descripcion,
                        item.serial,
                        item.usuario,
                        item.cantidad,
                        item.detalle,
                        item.recibido_por
                    }
                );
            }

            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(Remito remito, string usuario)
        {
            var remitoExistente = await _context.Remitos
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == remito.Id);

            if (remitoExistente == null)
                throw new InvalidOperationException($"No se encontró el remito con ID {remito.Id}");

            if (remitoExistente.Numero != remito.Numero ||
                remitoExistente.Fecha != remito.Fecha ||
                remitoExistente.Destino != remito.Destino)
            {
                await _auditoriaService.RegistrarAuditoriaRemito(
                    remito.Id,
                    "UPDATE",
                    usuario,
                    new { remitoExistente.Numero, remitoExistente.Fecha, remitoExistente.Destino },
                    new { remito.Numero, remito.Fecha, remito.Destino }
                );

                remitoExistente.Numero = remito.Numero;
                remitoExistente.Fecha = remito.Fecha;
                remitoExistente.Destino = remito.Destino;
            }

            var itemsActuales = remitoExistente.Items.ToList();
            var itemsNuevos = remito.Items.ToList();
            var itemsParaAuditarInsert = new List<ItemRemito>();

            foreach (var itemNuevo in itemsNuevos)
            {
                var existente = itemsActuales.FirstOrDefault(i => i.Id == itemNuevo.Id);

                if (existente != null)
                {
                    bool huboCambios = existente.numero_item != itemNuevo.numero_item ||
                                       existente.descripcion != itemNuevo.descripcion ||
                                       existente.serial != itemNuevo.serial ||
                                       existente.usuario != itemNuevo.usuario ||
                                       existente.cantidad != itemNuevo.cantidad ||
                                       existente.detalle != itemNuevo.detalle ||
                                       existente.recibido_por != itemNuevo.recibido_por;

                    if (huboCambios)
                    {
                        await _auditoriaService.RegistrarAuditoriaItem(
                            existente.Id,
                            remito.Id,
                            "UPDATE",
                            usuario,
                            new { existente.numero_item, existente.descripcion, existente.serial, existente.usuario, existente.cantidad, existente.detalle, existente.recibido_por },
                            new { itemNuevo.numero_item, itemNuevo.descripcion, itemNuevo.serial, itemNuevo.usuario, itemNuevo.cantidad, itemNuevo.detalle, itemNuevo.recibido_por }
                        );

                        existente.numero_item = itemNuevo.numero_item;
                        existente.descripcion = itemNuevo.descripcion;
                        existente.serial = itemNuevo.serial;
                        existente.usuario = itemNuevo.usuario;
                        existente.cantidad = itemNuevo.cantidad;
                        existente.detalle = itemNuevo.detalle;
                        existente.recibido_por = itemNuevo.recibido_por;
                    }
                }
                else
                {
                    itemNuevo.Id = 0;
                    itemNuevo.id_remito = remitoExistente.Id;
                    _context.ItemsRemito.Add(itemNuevo);
                    itemsParaAuditarInsert.Add(itemNuevo);
                }
            }

            var idsNuevos = itemsNuevos.Where(i => i.Id > 0).Select(i => i.Id).ToList();
            var paraEliminar = itemsActuales.Where(i => !idsNuevos.Contains(i.Id)).ToList();

            foreach (var item in paraEliminar)
            {
                await _auditoriaService.RegistrarAuditoriaItem(
                    item.Id,
                    remito.Id,
                    "DELETE",
                    usuario,
                    new { item.numero_item, item.descripcion, item.serial, item.usuario, item.cantidad, item.detalle, item.recibido_por },
                    null
                );
            }

            if (paraEliminar.Any())
                _context.ItemsRemito.RemoveRange(paraEliminar);

            await _context.SaveChangesAsync();

            foreach (var item in itemsParaAuditarInsert)
            {
                await _auditoriaService.RegistrarAuditoriaItem(
                    item.Id,
                    remito.Id,
                    "INSERT",
                    usuario,
                    null,
                    new { item.numero_item, item.descripcion, item.serial, item.usuario, item.cantidad, item.detalle, item.recibido_por }
                );
            }

            if (itemsParaAuditarInsert.Any())
                await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(int id, string usuario)
        {
            var remito = await _context.Remitos
                .Include(r => r.Items)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (remito != null)
            {
                foreach (var item in remito.Items)
                {
                    await _auditoriaService.RegistrarAuditoriaItem(
                        item.Id,
                        remito.Id,
                        "DELETE",
                        usuario,
                        new { item.numero_item, item.descripcion, item.serial, item.usuario, item.cantidad, item.detalle, item.recibido_por },
                        null
                    );
                }


                await _auditoriaService.RegistrarAuditoriaRemito(
                    remito.Id,
                    "DELETE",
                    usuario,
                    new { remito.Numero, remito.Fecha, remito.Destino },
                    null
                );

                _context.Remitos.Remove(remito);
                await _context.SaveChangesAsync();
            }
        }
    }
}