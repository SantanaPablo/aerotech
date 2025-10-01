using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.IO;
using System;
using Negocio;
using Dominio;
using Microsoft.AspNetCore.Hosting;

public class DetalleModel : PageModel
{
    private readonly RemitoNegocio _remitoNegocio;
    private readonly ItemRemitoNegocio _itemRemitoNegocio;
    private readonly IWebHostEnvironment _env;

    public DetalleModel(
        RemitoNegocio remitoNegocio,
        ItemRemitoNegocio itemRemitoNegocio,
        IWebHostEnvironment env)
    {
        _remitoNegocio = remitoNegocio;
        _itemRemitoNegocio = itemRemitoNegocio;
        _env = env;
    }

    public Remito Remito { get; set; }
    public List<ItemRemito> Items { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Remito = await _remitoNegocio.ObtenerPorIdAsync(id);
        if (Remito == null) return NotFound();

        Items = await _itemRemitoNegocio.ObtenerPorRemitoIdAsync(id);
        return Page();
    }


}