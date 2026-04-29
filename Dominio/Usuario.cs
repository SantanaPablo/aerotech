using Dominio;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    public string Legajo { get; set; }
    public string Contrasena { get; set; }
    public int RolId { get; set; }
    public Rol Rol { get; set; }
}
