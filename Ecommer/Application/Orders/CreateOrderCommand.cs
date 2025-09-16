namespace Ecommer.Application.Orders;

public class CreateOrderCommand
{
    public CustomerInfoDto CustomerInfo { get; set; } = default!;
    public ShippingAddressDto ShippingAddress { get; set; } = default!;
    public List<OrderItemDto> Items { get; set; } = new();
    public string PaymentMethod { get; set; } = default!;
    public string? Notes { get; set; }
    public string? VoucherCode { get; set; }
    public decimal Subtotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Total { get; set; }
}

public class CustomerInfoDto
{
    public long UserId { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Email { get; set; } = default!;
    public bool IsGuest { get; set; }
    public bool CreateAccount { get; set; }
}

public class ShippingAddressDto
{
    public string Address { get; set; } = default!;
    public string Ward { get; set; } = default!;
    public string District { get; set; } = default!;
    public string City { get; set; } = default!;
    public string? PostalCode { get; set; }
}

public class OrderItemDto
{
    public long ProductId { get; set; }
    public long VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
