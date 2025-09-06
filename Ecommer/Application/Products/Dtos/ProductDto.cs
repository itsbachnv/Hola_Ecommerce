namespace Ecommer.Application.Products.Dtos;

public record ProductDto(
    long Id,
    string Name,
    string Slug,
    long? BrandId,
    long? CategoryId,
    string Status,
    string? Description,
    DateTimeOffset UpdatedAt
);