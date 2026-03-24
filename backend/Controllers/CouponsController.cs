using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Models;

namespace RetailOrdering.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController(AppDbContext db) : ControllerBase
{
    [HttpPost("validate")]
    public async Task<ActionResult<CouponValidationResponse>> Validate([FromBody] ValidateCouponRequest request)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(coupon =>
            coupon.Code.ToLower() == request.Code.Trim().ToLower() && coupon.IsActive);

        if (coupon is null)
        {
            return Ok(new CouponValidationResponse
            {
                Valid = false,
                Code = request.Code,
                FinalAmount = request.Amount,
                Message = "Coupon is invalid or inactive."
            });
        }

        var discountAmount = coupon.DiscountType == DiscountTypes.Percentage
            ? Math.Round(request.Amount * (coupon.DiscountValue / 100), 2)
            : coupon.DiscountValue;

        return Ok(new CouponValidationResponse
        {
            Valid = true,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            DiscountAmount = discountAmount,
            FinalAmount = Math.Max(0, request.Amount - discountAmount),
            Message = "Coupon applied successfully."
        });
    }
}
