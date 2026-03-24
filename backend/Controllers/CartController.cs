using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Extensions;

namespace RetailOrdering.Controllers;

[Authorize]
[ApiController]
[Route("api/cart")]
public class CartController(AppDbContext db) : ControllerBase
{
    
    [HttpGet]
    public async Task<ActionResult<CartResponse>> GetCart()
    {
        if (User.GetUserRole() == Models.Roles.Admin)
            return Forbid();
        return Ok(await BuildCartResponse(User.GetUserId()));
    }

    [HttpPost("add")]
    public async Task<ActionResult<CartResponse>> Add([FromBody] AddCartItemRequest request)
    {
        if (User.GetUserRole() == Models.Roles.Admin)
            return Forbid();
        var userId = User.GetUserId();
        var product = await db.Products.Include(item => item.Inventory).FirstOrDefaultAsync(item => item.Id == request.ProductId && item.IsActive);
        if (product is null)
        {
            return NotFound(new ApiMessageResponse { Message = "Product not found." });
        }

        if (product.Inventory is null || product.Inventory.StockQty < request.Quantity)
        {
            return BadRequest(new ApiMessageResponse { Message = "Not enough stock available." });
        }

        var existing = await db.CartItems.FirstOrDefaultAsync(item => item.UserId == userId && item.ProductId == request.ProductId);
        if (existing is null)
        {
            db.CartItems.Add(new Models.CartItem
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                AddedAt = DateTime.UtcNow
            });
        }
        else
        {
            if (product.Inventory.StockQty < existing.Quantity + request.Quantity)
            {
                return BadRequest(new ApiMessageResponse { Message = "Requested quantity exceeds stock." });
            }

            existing.Quantity += request.Quantity;
        }

        await db.SaveChangesAsync();
        return Ok(await BuildCartResponse(userId));
    }

    [HttpPut("update")]
    public async Task<ActionResult<CartResponse>> Update([FromBody] UpdateCartItemRequest request)
    {
        if (User.GetUserRole() == Models.Roles.Admin)
            return Forbid();
        var userId = User.GetUserId();
        var cartItem = await db.CartItems
            .Include(item => item.Product)
            .ThenInclude(product => product!.Inventory)
            .FirstOrDefaultAsync(item => item.Id == request.CartItemId && item.UserId == userId);

        if (cartItem is null)
        {
            return NotFound(new ApiMessageResponse { Message = "Cart item not found." });
        }

        if (request.Quantity <= 0)
        {
            db.CartItems.Remove(cartItem);
        }
        else
        {
            if (cartItem.Product?.Inventory is null || cartItem.Product.Inventory.StockQty < request.Quantity)
            {
                return BadRequest(new ApiMessageResponse { Message = "Requested quantity exceeds stock." });
            }

            cartItem.Quantity = request.Quantity;
        }

        await db.SaveChangesAsync();
        return Ok(await BuildCartResponse(userId));
    }

    [HttpDelete("remove/{id:int}")]
    public async Task<ActionResult<CartResponse>> Remove(int id)
    {
        if (User.GetUserRole() == Models.Roles.Admin)
            return Forbid();
        var userId = User.GetUserId();
        var item = await db.CartItems.FirstOrDefaultAsync(cartItem => cartItem.Id == id && cartItem.UserId == userId);
        if (item is null)
        {
            return NotFound(new ApiMessageResponse { Message = "Cart item not found." });
        }

        db.CartItems.Remove(item);
        await db.SaveChangesAsync();
        return Ok(await BuildCartResponse(userId));
    }

    [HttpDelete("clear")]
    public async Task<ActionResult<ApiMessageResponse>> Clear()
    {
        if (User.GetUserRole() == Models.Roles.Admin)
            return Forbid();
        var userId = User.GetUserId();
        var items = await db.CartItems.Where(item => item.UserId == userId).ToListAsync();
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync();
        return Ok(new ApiMessageResponse { Message = "Cart cleared successfully." });
    }

    private async Task<CartResponse> BuildCartResponse(int userId)
    {
        var items = await db.CartItems
            .Where(item => item.UserId == userId)
            .Include(item => item.Product)
            .ThenInclude(product => product!.Inventory)
            .OrderByDescending(item => item.AddedAt)
            .Select(item => new CartItemResponse
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product!.Name,
                Category = item.Product.Category,
                Brand = item.Product.Brand,
                Packaging = item.Product.Packaging,
                Price = item.Product.Price,
                Quantity = item.Quantity,
                StockQty = item.Product.Inventory != null ? item.Product.Inventory.StockQty : 0
            })
            .ToListAsync();

        return new CartResponse
        {
            Items = items,
            Subtotal = items.Sum(item => item.Price * item.Quantity)
        };
    }
}
