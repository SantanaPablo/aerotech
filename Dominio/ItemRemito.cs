using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dominio
{
    [Table("items_remito")]
    public class ItemRemito
    {
        [Key]
        public int Id { get; set; }

        public int numero_item { get; set; }

        [Required(ErrorMessage = "La descripción es obligatoria")]
        public string? descripcion { get; set; }

        public string? serial { get; set; }

        public string? usuario { get; set; }

        [Required(ErrorMessage = "La cantidad es obligatoria")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int cantidad { get; set; }

        public string? detalle { get; set; }

        public string? recibido_por { get; set; }

        public int id_remito { get; set; }

        [ForeignKey("id_remito")]
        public Remito? Remito { get; set; }
    }
}