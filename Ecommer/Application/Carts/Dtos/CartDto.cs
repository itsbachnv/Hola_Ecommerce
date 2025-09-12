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
)
{
    // Calculated properties for selected items only
    public decimal SelectedItemsTotalAmount => Items.Where(i => i.IsSelectedForCheckout).Sum(i => i.TotalPrice);
    public int SelectedItemsCount => Items.Where(i => i.IsSelectedForCheckout).Sum(i => i.Quantity);
    public List<CartItemDto> SelectedItems => Items.Where(i => i.IsSelectedForCheckout).ToList();
};