using Ecommer.Application.Variants.Dtos;
using Ecommer.Domain;

namespace Ecommer.Application.Variants.Dtos;

public static class VariantMapping
{
    public static VariantDto ToDto(this Variant variant, bool isAdmin = false)
    {
        return new VariantDto
        {
            Id = variant.Id,
            ProductId = variant.ProductId,
            Sku = variant.Sku,
            Name = variant.Name,
            Price = variant.Price,
            CompareAtPrice = variant.CompareAtPrice,
            StockQty = isAdmin ? variant.StockQty : (variant.StockQty > 0 ? variant.StockQty : 0), // Non-admin chỉ xem stock nếu > 0
            WeightGrams = variant.WeightGrams,
            Attributes = variant.Attributes,
            CreatedAt = variant.CreatedAt,
            UpdatedAt = variant.UpdatedAt,
            ProductName = variant.Product?.Name
        };
    }

    public static Variant ToEntity(this CreateVariantDto dto)
    {
        return new Variant
        {
            ProductId = dto.ProductId,
            Sku = dto.Sku,
            Name = dto.Name,
            Price = dto.Price,
            CompareAtPrice = dto.CompareAtPrice,
            StockQty = dto.StockQty,
            WeightGrams = dto.WeightGrams,
            Attributes = dto.Attributes
        };
    }

    public static void UpdateEntity(this UpdateVariantDto dto, Variant variant)
    {
        variant.Sku = dto.Sku;
        variant.Name = dto.Name;
        variant.Price = dto.Price;
        variant.CompareAtPrice = dto.CompareAtPrice;
        variant.StockQty = dto.StockQty;
        variant.WeightGrams = dto.WeightGrams;
        variant.Attributes = dto.Attributes;
    }
}
