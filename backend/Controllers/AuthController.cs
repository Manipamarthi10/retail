using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailOrdering.DTOs;
using RetailOrdering.Extensions;
using RetailOrdering.Services;
//AuthController.cs
namespace RetailOrdering.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            return Ok(await authService.RegisterAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiMessageResponse { Message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            return Ok(await authService.LoginAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new ApiMessageResponse { Message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> Profile()
    {
        var user = await authService.GetUserAsync(User.GetUserId());
        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            LoyaltyPoints = user.LoyaltyPoints,
            CreatedAt = user.CreatedAt
        });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            return Ok(await authService.UpdateProfileAsync(User.GetUserId(), request));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiMessageResponse { Message = ex.Message });
        }
    }
}
