using Ecommer.Domain;
using Ecommer.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommer.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> opt) : base(opt)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Variant> Variants => Set<Variant>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Voucher> Vouchers => Set<Voucher>();
    public DbSet<VoucherRedemption> VoucherRedemptions => Set<VoucherRedemption>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<InventoryLedger> InventoryLedger => Set<InventoryLedger>();
    public DbSet<StockReservation> StockReservations => Set<StockReservation>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<IdempotencyKey> IdempotencyKeys => Set<IdempotencyKey>();
    public DbSet<GuestInfo> GuestInfos => Set<GuestInfo>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // ----- PostgreSQL enums -----
        mb.HasPostgresEnum<VoucherType>();
        mb.HasPostgresEnum<OrderStatus>();
        mb.HasPostgresEnum<PaymentStatus>();
        mb.HasPostgresEnum<ShipmentStatus>();
        mb.HasPostgresEnum<InventoryTxnType>();
        mb.HasPostgresEnum<ChatRole>();

        // ----- Users -----
        mb.Entity<User>(e =>
        {
            e.ToTable("users");
            e.Property(p => p.Meta).HasColumnType("jsonb");
            e.HasIndex(p => p.Email).IsUnique();
        });

        // ----- Brands -----
        mb.Entity<Brand>(e =>
        {
            e.ToTable("brands");
            e.HasIndex(p => p.Name).IsUnique();
            e.HasIndex(p => p.Slug).IsUnique();
        });

        // ----- Categories -----
        mb.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasOne(p => p.Parent)
                .WithMany()
                .HasForeignKey(p => p.ParentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ----- Products -----
        mb.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.Property(p => p.Attributes).HasColumnType("jsonb");
            e.Property(p => p.Status).HasDefaultValue("Active");
            e.HasIndex(p => p.Slug).IsUnique();
            e.HasOne(p => p.Brand).WithMany().HasForeignKey(p => p.BrandId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(p => p.Category).WithMany().HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
        });

        // ----- ProductImages -----
        mb.Entity<ProductImage>(e =>
        {
            e.ToTable("product_images");
            e.HasOne(p => p.Product).WithMany(p => p.Images).HasForeignKey(p => p.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Variants -----
        mb.Entity<Variant>(e =>
        {
            e.ToTable("variants");
            e.Property(p => p.Price).HasPrecision(12, 2);
            e.Property(p => p.CompareAtPrice).HasPrecision(12, 2);
            e.Property(p => p.Attributes).HasColumnType("jsonb");
            e.HasIndex(p => p.Sku).IsUnique();
            e.HasOne(v => v.Product).WithMany(p => p.Variants).HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Carts -----
        mb.Entity<Cart>(e =>
        {
            e.ToTable("carts");
            e.Property(p => p.Status).HasDefaultValue("Active");
            e.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        mb.Entity<CartItem>(e =>
        {
            e.ToTable("cart_items");
            e.Property(p => p.UnitPrice).HasPrecision(12, 2);
            e.Property(p => p.TotalPrice).HasPrecision(12, 2);
            e.HasOne(i => i.Cart).WithMany(c => c.Items).HasForeignKey(i => i.CartId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Variant).WithMany().HasForeignKey(i => i.VariantId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(p => new { p.CartId, p.VariantId }).IsUnique();
            e.HasCheckConstraint("CK_cart_items_qty", "\"Quantity\" > 0");
        });

        // ----- Orders -----
        mb.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.Property(p => p.Subtotal).HasPrecision(12, 2);
            e.Property(p => p.DiscountTotal).HasPrecision(12, 2);
            e.Property(p => p.ShippingFee).HasPrecision(12, 2);
            e.Property(p => p.TaxTotal).HasPrecision(12, 2);
            e.Property(p => p.GrandTotal).HasPrecision(12, 2);
            e.Property(p => p.ShippingAddress).HasColumnType("jsonb");
            e.Property(p => p.BillingAddress).HasColumnType("jsonb");
            e.HasIndex(p => p.Code).IsUnique();
            e.HasIndex(p => p.Status);
            e.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        mb.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.Property(p => p.UnitPrice).HasPrecision(12, 2);
            e.Property(p => p.TotalPrice).HasPrecision(12, 2);
            e.HasOne(i => i.Order).WithMany(o => o.Items).HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Variant).WithMany().HasForeignKey(i => i.VariantId).OnDelete(DeleteBehavior.Restrict);
            e.HasCheckConstraint("CK_order_items_qty", "\"Quantity\" > 0");
        });

        // ----- Vouchers -----
        mb.Entity<Voucher>(e =>
        {
            e.ToTable("vouchers");
            e.Property(p => p.Type).HasColumnType("voucher_type");
            e.Property(p => p.Value).HasPrecision(12, 2);
            e.Property(p => p.MinSubtotal).HasPrecision(12, 2).HasDefaultValue(0);
            e.Property(p => p.Scope).HasColumnType("jsonb");
            e.HasIndex(p => p.Code).IsUnique();
            e.HasCheckConstraint("CK_voucher_time", "\"EndAt\" > \"StartAt\"");
        });

        mb.Entity<VoucherRedemption>(e =>
        {
            e.ToTable("voucher_redemptions");
            e.HasOne(p => p.Voucher).WithMany().HasForeignKey(p => p.VoucherId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(p => p.Order).WithMany().HasForeignKey(p => p.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Payments -----
        mb.Entity<Payment>(e =>
        {
            e.ToTable("payments");
            e.Property(p => p.Status).HasColumnType("payment_status");
            e.Property(p => p.Amount).HasPrecision(12, 2);
            e.Property(p => p.Payload).HasColumnType("jsonb");
            e.HasOne(p => p.Order).WithMany(o => o.Payments).HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Shipments -----
        mb.Entity<Shipment>(e =>
        {
            e.ToTable("shipments");
            e.Property(p => p.Status).HasColumnType("shipment_status");
            e.Property(p => p.Fee).HasPrecision(12, 2);
            e.Property(p => p.Address).HasColumnType("jsonb");
            e.HasOne(s => s.Order).WithMany(o => o.Shipments).HasForeignKey(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ----- Inventory -----
        mb.Entity<InventoryLedger>(e =>
        {
            e.ToTable("inventory_ledger");
            e.Property(p => p.Type).HasColumnType("inventory_txn_type");
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Variant).WithMany().HasForeignKey(i => i.VariantId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<StockReservation>(e =>
        {
            e.ToTable("stock_reservations");
            e.HasOne(i => i.Order).WithMany().HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Variant).WithMany().HasForeignKey(i => i.VariantId).OnDelete(DeleteBehavior.Restrict);
        });

        // ----- Audit / Idempotency / Chat -----
        mb.Entity<AuditLog>(e =>
        {
            e.ToTable("audit_logs");
            e.Property(p => p.Diff).HasColumnType("jsonb");
            e.HasIndex(p => new { p.Entity, p.EntityId });
        });

        mb.Entity<IdempotencyKey>(e =>
        {
            e.ToTable("idempotency_keys");
            e.HasIndex(p => new { p.Key, p.Scope }).IsUnique();
        });
        
        // ===== GuestInfo =====
        mb.Entity<GuestInfo>(e =>
        {
            e.ToTable("guest_infos");
            e.HasKey(p => p.GuestId);
            e.Property(p => p.Status).HasMaxLength(20).HasDefaultValue("new");
            e.Property(p => p.CreatedAt).HasDefaultValueSql("now()");
            e.Property(p => p.LastMessageAt).HasDefaultValueSql("now()");
            e.HasIndex(p => p.Email);
            e.HasIndex(p => p.PhoneNumber);
        });

        // ===== ChatMessage =====
        mb.Entity<ChatMessage>(e =>
        {
            e.ToTable("chat_messages");
            e.HasKey(p => p.Id);
            e.Property(p => p.Message).IsRequired();
            e.Property(p => p.Timestamp).HasDefaultValueSql("now()");
            e.HasIndex(p => new { p.SenderId, p.ReceiverId });
        });

        // ===== Notification =====
        mb.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.HasKey(p => p.NotificationId);
            e.Property(p => p.Title).HasMaxLength(255);
            e.Property(p => p.NotificationType).HasMaxLength(50);
            e.HasIndex(p => p.CreatedAt); // sort nhanh theo thời gian tạo
        });
    }
}
