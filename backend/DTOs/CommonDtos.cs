namespace RetailOrdering.DTOs;

public class ApiMessageResponse
{
    public string Message { get; set; } = string.Empty;
}

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int LoyaltyPoints { get; set; }
    public DateTime CreatedAt { get; set; }
}
