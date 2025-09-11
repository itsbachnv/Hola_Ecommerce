namespace Ecommer.Application.Carts.Dtos;

public record CartDto(
    long Id,
    long? UserId,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    List<CartItemDto> Items,
    decimal TotalAmount,
    int TotalItems
);