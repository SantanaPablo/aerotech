using System.ComponentModel.DataAnnotations;
public class NotaPSA
{
    public int Id { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria")]
    public DateTime Fecha { get; set; } = DateTime.Now;

    [Required(ErrorMessage = "Debe indicar si es Ingreso o Egreso")]
    [StringLength(20)]
    public string Tipo { get; set; } // Ingreso / Egreso

    [Required(ErrorMessage = "El organismo es obligatorio")]
    [StringLength(150)]
    public string Organismo { get; set; }

    [Required(ErrorMessage = "El sector es obligatorio")]
    [StringLength(150)]
    public string Sector { get; set; }

    [Required(ErrorMessage = "Debe especificar el tipo de solicitud")]
    [StringLength(50)]
    public string TipoSolicitud { get; set; } // Transitoria / Permanente

    [Required(ErrorMessage = "Debe especificar el motivo")]
    [StringLength(300)]
    public string Motivo { get; set; }

    [Required(ErrorMessage = "Debe indicar la fecha desde")]
    public DateTime Desde { get; set; }

    [Required(ErrorMessage = "Debe indicar la fecha hasta")]
    public DateTime Hasta { get; set; }

    [Required(ErrorMessage = "Debe especificar el horario")]
    [StringLength(100)]
    public string Horario { get; set; }

    [Required(ErrorMessage = "Debe especificar el puesto de ingreso")]
    [StringLength(100)]
    public string PuestoIngreso { get; set; }

    // Relación con Usuario (autorizante)
    public int? AutorizanteId { get; set; }
    public Usuario? Autorizante { get; set; }

    public List<ItemNotaPSA> Items { get; set; } = new();
}
