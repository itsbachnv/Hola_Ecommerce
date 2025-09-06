using Ecommer.Application.Abstractions;
using Ecommer.Application.Products.Dtos;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Products.Commands;

public record UpdateProductCommand(
    long Id,
    string Name,
    string Slug,
    long? BrandId,
    long? CategoryId,
    string? Description,
    string Status
) : IRequest<ProductDto?>;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    public UpdateProductHandler(IProductRepository productRepository) => _productRepository = productRepository;

    public async Task<ProductDto?> Handle(UpdateProductCommand c, CancellationToken ct)
    {
        var p = await _productRepository.FindAsync(c.Id, ct);
        if (p is null) return null;

        p.Name = c.Name.Trim();
        p.Slug = c.Slug.Trim();
        p.BrandId = c.BrandId;
        p.CategoryId = c.CategoryId;
        p.Description = c.Description;
        p.Status = c.Status;
        p.UpdatedAt = DateTimeOffset.UtcNow;
        
        _productRepository.Update(p);
        return p.ToDto();
    }
}