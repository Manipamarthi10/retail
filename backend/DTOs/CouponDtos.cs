namespace RetailOrdering.DTOs;

public class ValidateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class CouponValidationResponse
{
    public bool Valid { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}
