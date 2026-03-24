using RetailOrdering.DTOs;

namespace RetailOrdering.Services;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(int userId, CreateOrderRequest request);
}
