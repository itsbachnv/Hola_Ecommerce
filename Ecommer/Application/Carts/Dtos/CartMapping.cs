using Ecommer.Domain;

namespace Ecommer.Application.Carts.Dtos;

public static class CartMapping
{
    public static CartDto ToDto(this Cart cart) =>
        new(
            cart.Id,
            cart.UserId,
            cart.Status,
            cart.CreatedAt,
            cart.UpdatedAt,
            cart.Items?.Select(item => item.ToDto()).ToList() ?? new List<CartItemDto>(),
            cart.Items?.Sum(item => item.TotalPrice) ?? 0,
            cart.Items?.Sum(item => item.Quantity) ?? 0
        );

    public static CartItemDto ToDto(this CartItem item) =>
        new(
            item.Id,
            item.CartId,
            item.ProductId,
            item.VariantId,
            item.Quantity,
            item.UnitPrice,
            item.TotalPrice,
            item.IsSelectedForCheckout,
            item.CreatedAt,
            item.Product?.Name ?? string.Empty,
            item.Variant?.Name,
            item.Product?.Images?.FirstOrDefault()?.Url,
            // Map variant attributes (JsonDocument) to a regular object for JSON serialization
            item.Variant?.Attributes != null ? (object)System.Text.Json.JsonSerializer.Deserialize<object>(item.Variant.Attributes.RootElement.GetRawText() ?? "null") : null
        );
}