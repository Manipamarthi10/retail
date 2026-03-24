using RetailOrdering.Models;

namespace RetailOrdering.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!db.Users.Any())
        {
            db.Users.AddRange(
                new User
                {
                    Name = "Admin User",
                    Email = "admin@retail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = Roles.Admin,
                    LoyaltyPoints = 250,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Demo Customer",
                    Email = "customer@retail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
                    Role = Roles.Customer,
                    LoyaltyPoints = 40,
                    CreatedAt = DateTime.UtcNow
                });
        }

        if (!db.Products.Any())
        {
            var products = new List<Product>
            {
                new() { Name = "Farmhouse Pizza", Category = "Pizza", Brand = "OvenJoy", Packaging = "Medium Box", Price = 289, Description = "Loaded with veggies and mozzarella.", IsActive = true },
                new() { Name = "Pepperoni Blast", Category = "Pizza", Brand = "OvenJoy", Packaging = "Large Box", Price = 399, Description = "Classic pepperoni with extra cheese.", IsActive = true },
                new() { Name = "Cola Classic", Category = "Cold Drinks", Brand = "FizzUp", Packaging = "500ml Bottle", Price = 49, Description = "Chilled carbonated soft drink.", IsActive = true },
                new() { Name = "Orange Spark", Category = "Cold Drinks", Brand = "FizzUp", Packaging = "330ml Can", Price = 39, Description = "Citrus-flavored sparkling drink.", IsActive = true },
                new() { Name = "Garlic Breadsticks", Category = "Breads", Brand = "BakeHouse", Packaging = "Pack of 4", Price = 129, Description = "Crispy garlic breadsticks with herbs.", IsActive = true },
                new() { Name = "Cheese Burst Bread", Category = "Breads", Brand = "BakeHouse", Packaging = "Pack of 2", Price = 149, Description = "Toasted bread with molten cheese center.", IsActive = true }
            };

            db.Products.AddRange(products);
            await db.SaveChangesAsync();

            db.Inventories.AddRange(products.Select((product, index) => new Inventory
            {
                ProductId = product.Id,
                StockQty = 20 + (index * 5),
                UpdatedAt = DateTime.UtcNow
            }));
        }

        if (!db.Coupons.Any())
        {
            db.Coupons.AddRange(
                new Coupon { Code = "WELCOME10", DiscountType = DiscountTypes.Percentage, DiscountValue = 10, IsActive = true },
                new Coupon { Code = "FLAT75", DiscountType = DiscountTypes.Flat, DiscountValue = 75, IsActive = true });
        }

        if (!db.Promotions.Any())
        {
            db.Promotions.AddRange(
                new Promotion
                {
                    Title = "Weekend Pizza Rush",
                    Description = "Save big on pizzas and cold drinks this weekend.",
                    StartDate = DateTime.UtcNow.AddDays(-2),
                    EndDate = DateTime.UtcNow.AddDays(5)
                },
                new Promotion
                {
                    Title = "Freshly Baked Combo",
                    Description = "Pair breads with drinks for the perfect side order.",
                    StartDate = DateTime.UtcNow.AddDays(-1),
                    EndDate = DateTime.UtcNow.AddDays(10)
                });
        }

        await db.SaveChangesAsync();
    }
}
