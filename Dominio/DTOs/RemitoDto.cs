using System.Text.Json.Serialization;
using System.Collections.Generic;
using System;

namespace Dominio.DTOs
{
    public class RemitoDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("numero")]
        public string Numero { get; set; } = string.Empty;

        [JsonPropertyName("fecha")]
        public DateTime Fecha { get; set; }

        [JsonPropertyName("destino")]
        public string Destino { get; set; } = string.Empty;

        [JsonPropertyName("items")]
        public List<ItemRemitoDto> Items { get; set; } = new();
    }

    public class ItemRemitoDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("id_remito")]
        public int IdRemito { get; set; }

        [JsonPropertyName("numero_item")]
        public int NumeroItem { get; set; }

        [JsonPropertyName("descripcion")]
        public string? Descripcion { get; set; }

        [JsonPropertyName("serial")]
        public string? Serial { get; set; }

        [JsonPropertyName("usuario")]
        public string? Usuario { get; set; }

        [JsonPropertyName("cantidad")]
        public int? Cantidad { get; set; }

        [JsonPropertyName("detalle")]
        public string? Detalle { get; set; }

        [JsonPropertyName("recibido_por")]
        public string? RecibidoPor { get; set; }
    }
}