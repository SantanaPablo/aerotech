using System.ComponentModel.DataAnnotations;
namespace Aerotech.Domain
{
    public class NotaEntrada
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "La fecha es obligatoria.")]
        public DateTime Fecha { get; set; }
        public bool Recibido { get; set; }

        [Required(ErrorMessage = "El técnico es obligatorio.")]
        public string Tecnico { get; set; }
        public string? RecibidoPor { get; set; }

        [Required(ErrorMessage = "El campo 'Dirigido a' es obligatorio.")]
        public string DirigidaA { get; set; }

        [Required(ErrorMessage = "Debe seleccionar un autorizante.")]
        public int AutorizanteId { get; set; }
        public Usuario? Autorizante { get; set; }

        [MinLength(1, ErrorMessage = "Debe agregar al menos un ítem.")]
        public List<ItemEntrada>? Items { get; set; }
    }
}