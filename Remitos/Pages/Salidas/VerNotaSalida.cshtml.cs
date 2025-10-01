using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Dominio;
using Microsoft.AspNetCore.Mvc;
using Negocio;

public class VerNotaSalidaModel : PageModel
{
    private readonly AppDbContext _context;

    public VerNotaSalidaModel(AppDbContext context)
    {
        _context = context;
    }

    public NotaSalida Nota { get; set; }
    public List<ItemSalida> Items { get; set; }
    public Usuario Usuario { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Nota = await _context.NotasSalida
            .Include(n => n.Autorizante)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (Nota == null)
            return NotFound();

        Usuario = Nota.Autorizante;
        Items = await _context.ItemsSalida
            .Where(i => i.NotaSalidaId == id)
            .ToListAsync();

        return Page();
    }

    
}