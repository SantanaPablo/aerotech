using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Dominio;
using Negocio;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

public class CrearRemitoModel : PageModel
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public string ultimo;
    public int ultimonum;

    [BindProperty]
    public Remito Remito { get; set; } = new();

    [BindProperty]
    public List<ItemRemito> Items { get; set; } = new();

    public List<string> DestinosDisponibles { get; set; } = new();

    public CrearRemitoModel(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public void OnGet()
    {
        Remito.Fecha = DateTime.Now;

        ultimo = _context.Remitos
                     .OrderByDescending(r => r.Numero)
                     .Select(r => r.Numero)
                     .FirstOrDefault();

        ultimonum = int.Parse(ultimo) + 1;
        ultimo = ultimonum.ToString();

        RecuperarItemsDeSession();
        if (Items.Count == 0) Items.Add(new ItemRemito { cantidad = 1, numero_item = 1 });
    }

    public IActionResult OnPostAddItem()
    {
       
        Items.Add(new ItemRemito
        {
            cantidad = 1,
            numero_item = Items.Count + 1
        });
        GuardarItemsEnSession();
        ModelState.Clear();
        return Page();
    }

    public IActionResult OnPostRemoveItem(int index)
    {
       
        if (index >= 0 && index < Items.Count)
            Items.RemoveAt(index);

        // Reordenar los números de ítem
        for (int i = 0; i < Items.Count; i++)
        {
            Items[i].numero_item = i + 1;
        }

        GuardarItemsEnSession();
        ModelState.Clear();
        return Page();
    }

    public async Task<IActionResult> OnPostGuardarAsync()
    {
       

        // Validación del remito principal
        if (string.IsNullOrWhiteSpace(Remito.Numero))
            ModelState.AddModelError("Remito.Numero", "El número de remito es obligatorio");

        if (string.IsNullOrWhiteSpace(Remito.Destino))
            ModelState.AddModelError("Remito.Destino", "El destino es obligatorio");

        // Validación de items
        if (Items == null || Items.Count < 1)
        {
            ModelState.AddModelError("", "Debe agregar al menos un ítem.");
        }

        for (int i = 0; i < Items.Count; i++)
        {
            if (string.IsNullOrWhiteSpace(Items[i].descripcion))
                ModelState.AddModelError($"Items[{i}].descripcion", "La descripción es obligatoria.");

            if (Items[i].cantidad <= 0)
                ModelState.AddModelError($"Items[{i}].cantidad", "La cantidad debe ser mayor a cero.");
        }

        // Asignar usuario logueado como creador
        var userIdClaim = User.FindFirst("UsuarioId")?.Value;
        if (int.TryParse(userIdClaim, out int usuarioId))
        {
            // Si tu modelo Remito tiene CreadorId
            // Remito.CreadorId = usuarioId;
        }

        if (!ModelState.IsValid)
            return Page();

        try
        {
            // Guardar el remito principal
            _context.Remitos.Add(Remito);
            await _context.SaveChangesAsync();

            // Guardar los items
            foreach (var item in Items)
            {
                item.id_remito = Remito.Id;
                _context.ItemsRemito.Add(item);
            }

            await _context.SaveChangesAsync();
            LimpiarSession();

            return RedirectToPage("VerDetalleRemito", new { id = Remito.Id });
        }
        catch (DbUpdateException ex)
        {
            ModelState.AddModelError("", "Error al guardar en la base de datos: " + ex.InnerException?.Message);
            return Page();
        }
    }

    private void CargarListas()
    {
        // Cargar destinos disponibles (similar a Tecnicos en NotaSalida)
        if (!_httpContextAccessor.HttpContext.Session.TryGetValue("DestinosJson", out _))
        {
            // Ejemplo: cargar destinos únicos desde la base de datos
            DestinosDisponibles = _context.Remitos
                .Select(r => r.Destino)
                .Distinct()
                .ToList();

            _httpContextAccessor.HttpContext.Session.SetString("DestinosJson",
                JsonConvert.SerializeObject(DestinosDisponibles));
        }
        else
        {
            DestinosDisponibles = JsonConvert.DeserializeObject<List<string>>(
                _httpContextAccessor.HttpContext.Session.GetString("DestinosJson"));
        }
    }

    private void RecuperarItemsDeSession()
    {
        var json = _httpContextAccessor.HttpContext.Session.GetString("ItemsRemitoJson");
        if (!string.IsNullOrEmpty(json))
        {
            Items = JsonConvert.DeserializeObject<List<ItemRemito>>(json);
        }
    }

    private void GuardarItemsEnSession()
    {
        _httpContextAccessor.HttpContext.Session.SetString("ItemsRemitoJson",
            JsonConvert.SerializeObject(Items));
    }

    private void LimpiarSession()
    {
        _httpContextAccessor.HttpContext.Session.Remove("ItemsRemitoJson");
        _httpContextAccessor.HttpContext.Session.Remove("DestinosJson");
    }
}