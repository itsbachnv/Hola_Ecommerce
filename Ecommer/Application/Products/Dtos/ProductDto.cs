using System.Text.Json;
using Ecommer.Application.Variants.Dtos;

namespace Ecommer.Application.Products.Dtos;

public class ProductDto
{
    public long Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string Slug { get; set; } = default!;
    public long? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public long? BrandId { get; set; }
    public string? BrandName { get; set; }
    public string Status { get; set; } = default!;
    public JsonDocument? Attributes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    
    // Images
    public ICollection<ProductImageDto>? Images { get; set; }
    public string? PrimaryImageUrl { get; set; } // URL của ảnh chính
    
    // Variants - chứa thông tin giá
    public ICollection<VariantDto>? Variants { get; set; }
    
    // Price range (tính từ variants) - chỉ admin mới thấy đầy đủ
    public decimal? MinPrice { get; set; } // Giá thấp nhất trong variants
    public decimal? MaxPrice { get; set; } // Giá cao nhất trong variants
}

public class ProductImageDto
{
    public long Id { get; set; }
    public string Url { get; set; } = default!;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string Slug { get; set; } = default!;
    public long? CategoryId { get; set; }
    public long? BrandId { get; set; }
    public string Status { get; set; } = "Active";
    public JsonDocument? Attributes { get; set; }
}

public class UpdateProductDto
{
    public long Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string Slug { get; set; } = default!;
    public long? CategoryId { get; set; }
    public long? BrandId { get; set; }
    public string Status { get; set; } = default!;
    public JsonDocument? Attributes { get; set; }
}
