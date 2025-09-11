namespace Ecommer.Application.Carts.Dtos;

public record CartItemDto(
    long Id,
    long CartId,
    long ProductId,
    long? VariantId,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    DateTimeOffset CreatedAt,
    string ProductName,
    string? VariantName,
    string? ProductImage
);