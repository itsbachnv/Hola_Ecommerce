using Ecommer.Domain;

namespace Ecommer.Application.Products.Dtos;

public static class ProductMapping
{
    public static ProductDto ToDto(this Product p) =>
        new(p.Id, p.Name, p.Slug, p.BrandId, p.CategoryId, p.Status, p.Description, p.UpdatedAt);
}