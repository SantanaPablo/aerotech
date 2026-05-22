using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Aerotech.Domain
{
    [Table("remitos")]
    public class Remito
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El número es obligatorio")]
        public string Numero { get; set; }

        [Required(ErrorMessage = "La fecha es obligatoria")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "El destino es obligatorio")]
        public string Destino { get; set; }

        public List<ItemRemito> Items { get; set; } = new List<ItemRemito>();
    }
}