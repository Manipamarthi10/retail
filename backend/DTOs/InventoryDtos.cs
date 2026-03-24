namespace RetailOrdering.DTOs;

public class UpdateInventoryRequest
{
    public int StockQty { get; set; }
}

public class InventoryResponse
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int StockQty { get; set; }
    public DateTime UpdatedAt { get; set; }
}
