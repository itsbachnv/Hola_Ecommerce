using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using Ecommer.Enums;

namespace Ecommer.Domain;

public class User
{
    public long Id { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? PasswordHash { get; set; }
    public string? FullName { get; set; }
    public string? Role { get; set; } // Admin | Customer | Guest
    public JsonDocument? Meta { get; set; }
    
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class GuestInfo
{
    [Key]
    public Guid GuestId { get; set; }

    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "new"; // "new" | "assigned" | "closed"
}

public class Brand
{
    public long Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class Category
{
    public long Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public long? ParentId { get; set; }
    public string? Path { get; set; }
    public DateTimeOffset ? CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ? UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Category? Parent { get; set; }
}

public class Product
{
    public long Id { get; set; }
    public long? BrandId { get; set; }
    public long? CategoryId { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public JsonDocument? Attributes { get; set; } // jsonb
    public string Status { get; set; } = "ACTIVE"; // ACTIVE | DRAFT | ARCHIVED
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Brand? Brand { get; set; }
    public Category? Category { get; set; }
    public ICollection<Variant> Variants { get; set; } = new List<Variant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
}

public class ProductImage
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public string Url { get; set; } = default!;
    public bool IsPrimary { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Product Product { get; set; } = default!;
}

public class Variant
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public string Sku { get; set; } = default!;
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQty { get; set; } = 0;
    public int? WeightGrams { get; set; }
    public JsonDocument? Attributes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public Product Product { get; set; } = default!;
}

public class Cart
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public string Status { get; set; } = "ACTIVE"; // Active | Converted | Abandoned
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public User? User { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem
{
    public long Id { get; set; }
    public long CartId { get; set; }
    public long ProductId { get; set; }
    public long? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public bool IsSelectedForCheckout { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Cart Cart { get; set; } = default!;
    public Product Product { get; set; } = default!;
    public Variant? Variant { get; set; }
}

public class Order
{
    public long Id { get; set; }
    public string Code { get; set; } = default!;
    public long? UserId { get; set; }
    public string? CustomerFullName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Ordered;
    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TaxTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public string? VoucherCode { get; set; }
    public JsonDocument? ShippingAddress { get; set; }
    public JsonDocument? BillingAddress { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public DateTimeOffset? ShippedAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }

    public User? User { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
}

public class OrderItem
{
    public long Id { get; set; }
    public long OrderId { get; set; }
    public long ProductId { get; set; }
    public long? VariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public Order Order { get; set; } = default!;
    public Product Product { get; set; } = default!;
    public Variant? Variant { get; set; }
}

public class Voucher
{
    public long Id { get; set; }
    public string Code { get; set; } = default!;
    public VoucherType Type { get; set; }
    public decimal Value { get; set; }
    public decimal MinSubtotal { get; set; } = 0;
    public DateTimeOffset StartAt { get; set; }
    public DateTimeOffset EndAt { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; } = 0;
    public JsonDocument? Scope { get; set; } // {brands:[], categories:[], products:[]}
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class VoucherRedemption
{
    public long Id { get; set; }
    public long VoucherId { get; set; }
    public long? UserId { get; set; }
    public long OrderId { get; set; }
    public DateTimeOffset RedeemedAt { get; set; } = DateTimeOffset.UtcNow;

    public Voucher Voucher { get; set; } = default!;
    public User? User { get; set; }
    public Order Order { get; set; } = default!;
}

public class Payment
{
    public long Id { get; set; }
    public long OrderId { get; set; }
    public string Provider { get; set; } = default!; // COD | MoMo | VNPAY | ...
    public string? ProviderTxnId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public JsonDocument? Payload { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? PaidAt { get; set; }
    public string Type { get; set; } = "PAYMENT"; // PAYMENT | REFUND
    public Order Order { get; set; } = default!;
}

public class Shipment
{
    public long Id { get; set; }
    public long OrderId { get; set; }
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Pending;
    public string? Carrier { get; set; }
    public string? TrackingNumber { get; set; }
    public decimal Fee { get; set; }
    public JsonDocument? Address { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ShippedAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }

    public Order Order { get; set; } = default!;
}

public class InventoryLedger
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public long? VariantId { get; set; }
    public InventoryTxnType Type { get; set; }
    public int Quantity { get; set; }
    public string? Reference { get; set; } // OrderCode, GRN, Manual...
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Product Product { get; set; } = default!;
    public Variant? Variant { get; set; }
}

public class StockReservation
{
    public long Id { get; set; }
    public long OrderId { get; set; }
    public long ProductId { get; set; }
    public long? VariantId { get; set; }
    public int Quantity { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public Order Order { get; set; } = default!;
    public Product Product { get; set; } = default!;
    public Variant? Variant { get; set; }
}

public class AuditLog
{
    public long Id { get; set; }
    public string? Actor { get; set; } // email/user id
    public string Action { get; set; } = default!;
    public string Entity { get; set; } = default!;
    public long? EntityId { get; set; }
    public JsonDocument? Diff { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class IdempotencyKey
{
    public long Id { get; set; }
    public string Key { get; set; } = default!;
    public string? Scope { get; set; } // e.g. "payments:provider:txnId"
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class ChatMessage
{
    public int Id { get; set; }
    public string SenderId { get; set; }
    public string ReceiverId { get; set; }
    public string Message { get; set; }
    public DateTime Timestamp { get; set; }
    public bool IsRead { get; set; } = false;
}

public class Notification
{
    [Key] public int NotificationId { get; set; }

    [ForeignKey("User")] 
    public long UserId { get; set; }
    public User User { get; set; }

    [MaxLength(255)] public string? Title { get; set; }

    public string? Message { get; set; }

    [MaxLength(50)]
    public string? NotificationType { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? RelatedObjectId { get; set; }

    public string? MappingUrl { get; set; }
}