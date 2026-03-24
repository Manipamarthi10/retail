using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Models;

namespace RetailOrdering.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAll([FromQuery] string? category, [FromQuery] string? brand)
    {
        var query = db.Products.Include(product => product.Inventory).AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(product => product.Category.ToLower() == category.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(product => product.Brand.ToLower() == brand.Trim().ToLower());
        }

        var products = await query
            .OrderBy(product => product.Category)
            .ThenBy(product => product.Name)
            .Select(product => new ProductResponse
            {
                Id = product.Id,
                Name = product.Name,
                Category = product.Category,
                Brand = product.Brand,
                Packaging = product.Packaging,
                Price = product.Price,
                Description = product.Description,
                IsActive = product.IsActive,
                StockQty = product.Inventory != null ? product.Inventory.StockQty : 0
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetById(int id)
    {
        var product = await db.Products
            .Include(item => item.Inventory)
            .Where(item => item.Id == id)
            .Select(item => new ProductResponse
            {
                Id = item.Id,
                Name = item.Name,
                Category = item.Category,
                Brand = item.Brand,
                Packaging = item.Packaging,
                Price = item.Price,
                Description = item.Description,
                IsActive = item.IsActive,
                StockQty = item.Inventory != null ? item.Inventory.StockQty : 0
            })
            .FirstOrDefaultAsync();

        return product is null ? NotFound(new ApiMessageResponse { Message = "Product not found." }) : Ok(product);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create([FromBody] ProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name.Trim(),
            Category = request.Category.Trim(),
            Brand = request.Brand.Trim(),
            Packaging = request.Packaging.Trim(),
            Price = request.Price,
            Description = request.Description.Trim(),
            IsActive = request.IsActive
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        var inventory = new Inventory
        {
            ProductId = product.Id,
            StockQty = request.StockQty,
            UpdatedAt = DateTime.UtcNow
        };

        db.Inventories.Add(inventory);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Category = product.Category,
            Brand = product.Brand,
            Packaging = product.Packaging,
            Price = product.Price,
            Description = product.Description,
            IsActive = product.IsActive,
            StockQty = inventory.StockQty
        });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> Update(int id, [FromBody] ProductRequest request)
    {
        var product = await db.Products.Include(item => item.Inventory).FirstOrDefaultAsync(item => item.Id == id);
        if (product is null)
        {
            return NotFound(new ApiMessageResponse { Message = "Product not found." });
        }

        product.Name = request.Name.Trim();
        product.Category = request.Category.Trim();
        product.Brand = request.Brand.Trim();
        product.Packaging = request.Packaging.Trim();
        product.Price = request.Price;
        product.Description = request.Description.Trim();
        product.IsActive = request.IsActive;

        if (product.Inventory is not null)
        {
            product.Inventory.StockQty = request.StockQty;
            product.Inventory.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        return Ok(new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Category = product.Category,
            Brand = product.Brand,
            Packaging = product.Packaging,
            Price = product.Price,
            Description = product.Description,
            IsActive = product.IsActive,
            StockQty = product.Inventory?.StockQty ?? 0
        });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiMessageResponse>> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null)
        {
            return NotFound(new ApiMessageResponse { Message = "Product not found." });
        }

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return Ok(new ApiMessageResponse { Message = "Product deleted successfully." });
    }
}
