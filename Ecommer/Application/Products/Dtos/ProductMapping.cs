using Ecommer.Application.Products.Dtos;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Domain;

namespace Ecommer.Application.Products.Dtos;

public static class ProductMapping
{
    public static ProductDto ToDto(this Product product, bool isAdmin = false)
    {
        var variants = product.Variants?.Where(v => isAdmin || v.StockQty > 0).ToList();
        
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Slug = product.Slug,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            BrandId = product.BrandId,
            BrandName = product.Brand?.Name,
            Status = product.Status,
            Attributes = product.Attributes,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt,
            
            // Images
            Images = product.Images?.Select(img => new ProductImageDto
            {
                Id = img.Id,
                Url = img.Url,
                IsPrimary = img.IsPrimary,
                SortOrder = img.SortOrder
            }).ToList(),
            PrimaryImageUrl = product.Images?.FirstOrDefault(img => img.IsPrimary)?.Url,
            
            // Variants với logic phân quyền
            Variants = variants?.Select(v => v.ToDto(isAdmin)).ToList(),
            
            // Price range tính từ variants
            MinPrice = variants?.Any() == true ? variants.Min(v => v.Price) : null,
            MaxPrice = variants?.Any() == true ? variants.Max(v => v.Price) : null
        };
    }

    public static Product ToEntity(this CreateProductDto dto)
    {
        return new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Slug = dto.Slug,
            CategoryId = dto.CategoryId,
            BrandId = dto.BrandId,
            Status = dto.Status,
            Attributes = dto.Attributes
        };
    }

    public static void UpdateEntity(this UpdateProductDto dto, Product product)
    {
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Slug = dto.Slug;
        product.CategoryId = dto.CategoryId;
        product.BrandId = dto.BrandId;
        product.Status = dto.Status;
        product.Attributes = dto.Attributes;
    }
}
