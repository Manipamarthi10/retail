using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Extensions;
using RetailOrdering.Models;
using RetailOrdering.Services;

namespace RetailOrdering.Controllers;

[Authorize]
[ApiController]
[Route("api/orders")]
public class OrderController(AppDbContext db, IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create([FromBody] CreateOrderRequest request)
    {
        if (User.GetUserRole() == Models.Roles.Admin)
            return Forbid();
        try
        {
            return Ok(await orderService.CreateOrderAsync(User.GetUserId(), request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiMessageResponse { Message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetMine()
    {
        return Ok(await QueryOrders().Where(order => order.UserId == User.GetUserId()).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id)
    {
        var order = await QueryOrders().FirstOrDefaultAsync(order => order.Id == id && order.UserId == User.GetUserId());
        return order is null ? NotFound(new ApiMessageResponse { Message = "Order not found." }) : Ok(order);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetAll()
    {
        return Ok(await QueryOrders().ToListAsync());
    }

    private IQueryable<OrderLookup> QueryOrders()
    {
        return db.Orders
            .Include(order => order.Items)
            .ThenInclude(item => item.Product)
            .OrderByDescending(order => order.PlacedAt)
            .Select(order => new OrderLookup
            {
                Id = order.Id,
                UserId = order.UserId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                PlacedAt = order.PlacedAt,
                Items = order.Items.Select(item => new OrderItemResponse
                {
                    ProductId = item.ProductId,
                    ProductName = item.Product!.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    LineTotal = item.Quantity * item.UnitPrice
                }).ToList()
            });
    }

    private class OrderLookup : OrderResponse
    {
        public int UserId { get; set; }
    }
}
