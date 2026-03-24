using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RetailOrdering.Data;
using RetailOrdering.DTOs;
using RetailOrdering.Models;

namespace RetailOrdering.Controllers;

[ApiController]
[Route("api/promotions")]
public class PromotionsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PromotionResponse>>> GetActive()
    {
        var now = DateTime.UtcNow;
        var items = await db.Promotions
            .Where(promotion => promotion.StartDate <= now && promotion.EndDate >= now)
            .OrderBy(promotion => promotion.StartDate)
            .Select(promotion => new PromotionResponse
            {
                Id = promotion.Id,
                Title = promotion.Title,
                Description = promotion.Description,
                StartDate = promotion.StartDate,
                EndDate = promotion.EndDate
            })
            .ToListAsync();

        return Ok(items);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<ActionResult<PromotionResponse>> Create([FromBody] PromotionRequest request)
    {
        var promotion = new Promotion
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        db.Promotions.Add(promotion);
        await db.SaveChangesAsync();

        return Ok(new PromotionResponse
        {
            Id = promotion.Id,
            Title = promotion.Title,
            Description = promotion.Description,
            StartDate = promotion.StartDate,
            EndDate = promotion.EndDate
        });
    }
}
