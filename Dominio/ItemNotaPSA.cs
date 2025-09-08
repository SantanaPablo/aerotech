using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Dominio
{
    [Table("items_notapsa")]
    public class ItemNotaPSA
    {
        [Key]
        public int Id { get; set; }

        // Número de ítem automático dentro de la Nota
        public int numero_item { get; set; }

        [Required(ErrorMessage = "La naturaleza es obligatoria")]
        [StringLength(100)]
        public string Naturaleza { get; set; }

        [Required(ErrorMessage = "La marca es obligatoria")]
        [StringLength(100)]
        public string Marca { get; set; }

        [Required(ErrorMessage = "El número de serie o registro es obligatorio")]
        [StringLength(100)]
        public string NumeroSerie { get; set; }

        [Required(ErrorMessage = "La cantidad es obligatoria")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; }

        // FK a NotaPSA
        public int NotaPSAId { get; set; }

        [ForeignKey("NotaPSAId")]
        public NotaPSA NotaPSA { get; set; }
    }
}
