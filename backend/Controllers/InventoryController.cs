using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Models;

namespace RetailOrdering.Controllers;

[ApiController]
[Route("api/inventory")]
public class InventoryController(AppDbContext db) : ControllerBase
{
    [Authorize(Roles = Roles.Admin)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryResponse>>> GetInventory()
    {
        var items = await db.Inventories
            .Include(inventory => inventory.Product)
            .OrderBy(inventory => inventory.Product!.Category)
            .ThenBy(inventory => inventory.Product!.Name)
            .Select(inventory => new InventoryResponse
            {
                ProductId = inventory.ProductId,
                ProductName = inventory.Product!.Name,
                Category = inventory.Product.Category,
                Brand = inventory.Product.Brand,
                StockQty = inventory.StockQty,
                UpdatedAt = inventory.UpdatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{productId:int}")]
    public async Task<ActionResult<InventoryResponse>> UpdateInventory(int productId, [FromBody] UpdateInventoryRequest request)
    {
        var inventory = await db.Inventories.Include(item => item.Product).FirstOrDefaultAsync(item => item.ProductId == productId);
        if (inventory is null)
        {
            return NotFound(new ApiMessageResponse { Message = "Inventory record not found." });
        }

        inventory.StockQty = request.StockQty;
        inventory.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new InventoryResponse
        {
            ProductId = inventory.ProductId,
            ProductName = inventory.Product!.Name,
            Category = inventory.Product.Category,
            Brand = inventory.Product.Brand,
            StockQty = inventory.StockQty,
            UpdatedAt = inventory.UpdatedAt
        });
    }
}
