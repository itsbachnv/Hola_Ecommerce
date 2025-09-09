using System.Text.Json;

namespace Ecommer.Application.Variants.Dtos;

public class VariantDto
{
    public long Id { get; set; }
    public long ProductId { get; set; }
    public string Sku { get; set; } = default!;
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQty { get; set; }
    public int? WeightGrams { get; set; }
    public JsonDocument? Attributes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public string? ProductName { get; set; }
}

public class CreateVariantDto
{
    public long ProductId { get; set; }
    public string Sku { get; set; } = default!;
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQty { get; set; } = 0;
    public int? WeightGrams { get; set; }
    public JsonDocument? Attributes { get; set; }
}

public class UpdateVariantDto
{
    public long Id { get; set; }
    public string Sku { get; set; } = default!;
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQty { get; set; }
    public int? WeightGrams { get; set; }
    public JsonDocument? Attributes { get; set; }
}
