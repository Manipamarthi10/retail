namespace RetailOrdering.Models;

public class Coupon
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = DiscountTypes.Percentage;
    public decimal DiscountValue { get; set; }
    public bool IsActive { get; set; } = true;
}
