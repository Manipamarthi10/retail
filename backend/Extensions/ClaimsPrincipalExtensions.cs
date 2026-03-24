using System.Security.Claims;

namespace RetailOrdering.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("sub")?.Value;

        return int.TryParse(claim, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("Invalid user context.");
    }
}
