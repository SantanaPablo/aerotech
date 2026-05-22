using System.ComponentModel.DataAnnotations;

namespace Aerotech.Domain
{
    public class ItemSalida
    {
        public int Id { get; set; }
        public int NotaSalidaId { get; set; }

        [Required(ErrorMessage = "La unidad es obligatoria.")]
        public string? Unidad { get; set; }

        [Required(ErrorMessage = "El equipo es obligatorio.")]
        public string? Equipo { get; set; }

        [Required(ErrorMessage = "El serial es obligatorio.")]
        public string? Serial { get; set; }

        [Required(ErrorMessage = "El usuario es obligatorio.")]
        public string? Usuario { get; set; }

        [Required(ErrorMessage = "El SD es obligatorio.")]
        public string? SD { get; set; }

        public NotaSalida? NotaSalida { get; set; }
    }
}