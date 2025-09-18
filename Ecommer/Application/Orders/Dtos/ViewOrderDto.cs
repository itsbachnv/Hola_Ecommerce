namespace Ecommer.Application.Orders.Dtos;

public class ViewOrderDto
{
    public long Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Refund { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? Note { get; set; }
    public string? Action { get; set; }

    public List<ViewOrderItemDto> Items { get; set; } = new();
}

public class ViewOrderItemDto
{
    public long ProductId { get; set; }
    public long VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class ViewOrderDetailDto
{
    public long Id { get; set; }
    public string OrderNumber { get; set; } = default!;
    public string Status { get; set; } = default!;
    public decimal Total { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal DiscountTotal { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
    public ShippingAddressDto ShippingAddress { get; set; } = new();
    public List<OrderItemsDto> Items { get; set; } = new();
    public string PaymentMethod { get; set; } = "Chưa xác định";
    public List<OrderLogDto> Logs { get; set; } = new();
}

public class ShippingAddressDtos
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

public class OrderItemsDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Image { get; set; }

    // Variant
    public long? VariantId { get; set; }
    public string? VariantName { get; set; }
    public string? VariantSku { get; set; }
    public string? VariantAttributes { get; set; }
}


public class OrderLogDto
{
    public string Time { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string? Note { get; set; }
}



