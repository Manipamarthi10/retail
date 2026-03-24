using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrdering.Data;
using RetailOrdering.Extensions;

namespace RetailOrdering.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet("loyalty")]
    public async Task<ActionResult<object>> GetLoyalty()
    {
        var user = await db.Users.FindAsync(User.GetUserId());
        return user is null
            ? NotFound(new { message = "User not found." })
            : Ok(new { loyaltyPoints = user.LoyaltyPoints });
    }
}
