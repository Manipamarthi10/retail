using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Models;

namespace RetailOrdering.Services;

public class OrderService(AppDbContext db, IEmailService emailService) : IOrderService
{
    public async Task<OrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request)
    {
        var cartItems = await db.CartItems
            .Where(item => item.UserId == userId)
            .Include(item => item.Product)
            .ThenInclude(product => product!.Inventory)
            .ToListAsync();

        if (cartItems.Count == 0)
        {
            throw new InvalidOperationException("Cart is empty.");
        }

        foreach (var item in cartItems)
        {
            if (item.Product?.Inventory is null || item.Product.Inventory.StockQty < item.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for {item.Product?.Name ?? "product"}.");
            }
        }

        var subtotal = cartItems.Sum(item => item.Product!.Price * item.Quantity);
        var discountAmount = 0m;

        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var coupon = await db.Coupons.FirstOrDefaultAsync(c =>
                c.Code.ToLower() == request.CouponCode!.Trim().ToLower() && c.IsActive);
            if (coupon is null)
            {
                throw new InvalidOperationException("Coupon is invalid.");
            }

            discountAmount = coupon.DiscountType == DiscountTypes.Percentage
                ? Math.Round(subtotal * (coupon.DiscountValue / 100), 2)
                : coupon.DiscountValue;
        }

        var finalAmount = Math.Max(0, subtotal - discountAmount);

        await using var transaction = await db.Database.BeginTransactionAsync();

        var order = new Order
        {
            UserId = userId,
            TotalAmount = finalAmount,
            Status = "Placed",
            PlacedAt = DateTime.UtcNow
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        db.OrderItems.AddRange(cartItems.Select(item => new OrderItem
        {
            OrderId = order.Id,
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            UnitPrice = item.Product!.Price
        }));

        foreach (var cartItem in cartItems)
        {
            cartItem.Product!.Inventory!.StockQty -= cartItem.Quantity;
            cartItem.Product.Inventory.UpdatedAt = DateTime.UtcNow;
        }

        var user = await db.Users.FirstAsync(item => item.Id == userId);
        user.LoyaltyPoints += (int)Math.Floor(finalAmount / 10);

        db.CartItems.RemoveRange(cartItems);
        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        await emailService.LogOrderConfirmationAsync(user, order);

        return await db.Orders
            .Where(item => item.Id == order.Id)
            .Include(item => item.Items)
            .ThenInclude(item => item.Product)
            .Select(orderEntity => new OrderResponse
            {
                Id = orderEntity.Id,
                TotalAmount = orderEntity.TotalAmount,
                Status = orderEntity.Status,
                PlacedAt = orderEntity.PlacedAt,
                Items = orderEntity.Items.Select(item => new OrderItemResponse
                {
                    ProductId = item.ProductId,
                    ProductName = item.Product!.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    LineTotal = item.Quantity * item.UnitPrice
                }).ToList()
            })
            .FirstAsync();
    }
}
