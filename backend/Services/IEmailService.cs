using RetailOrdering.Models;

namespace RetailOrdering.Services;

public interface IEmailService
{
    Task LogOrderConfirmationAsync(User user, Order order);
}
