using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dominio
{
    public class AuditoriaRemito
    {
        public int Id { get; set; }
        public int IdRemito { get; set; }
        public string TipoOperacion { get; set; } = string.Empty;
        public string UsuarioOperacion { get; set; } = string.Empty;
        public DateTime FechaOperacion { get; set; }
        public string? DatosAnteriores { get; set; } // JSON
        public string? DatosNuevos { get; set; } // JSON
    }

    public class AuditoriaItemRemito
    {
        public int Id { get; set; }
        public int IdItem { get; set; }
        public int IdRemito { get; set; }
        public string TipoOperacion { get; set; } = string.Empty;
        public string UsuarioOperacion { get; set; } = string.Empty;
        public DateTime FechaOperacion { get; set; }
        public string? DatosAnteriores { get; set; } // JSON
        public string? DatosNuevos { get; set; } // JSON
    }
}
