using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.Models;

namespace RetailOrdering.Services;

public class EmailLogService(ILogger<EmailLogService> logger, AppDbContext db) : IEmailService
{
    public async Task LogOrderConfirmationAsync(User user, Order order)
    {
        var orderWithItems = await db.Orders
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstAsync(x => x.Id == order.Id);

        var itemLines = orderWithItems.Items.Select(item =>
            $"- {item.Product?.Name} x {item.Quantity} = {item.Quantity * item.UnitPrice:C}");

        logger.LogInformation(
            "SIMULATED EMAIL\nTo: {Email}\nSubject: Order #{OrderId} confirmed\nHello {Name},\nTotal: {Total:C}\nItems:\n{Items}",
            user.Email,
            order.Id,
            user.Name,
            order.TotalAmount,
            string.Join(Environment.NewLine, itemLines));
    }
}
