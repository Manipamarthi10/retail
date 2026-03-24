namespace RetailOrdering.Models;

public class Inventory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int StockQty { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
}
