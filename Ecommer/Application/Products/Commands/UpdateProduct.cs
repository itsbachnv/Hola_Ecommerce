using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Products.Dtos;
using Ecommer.Domain;
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
    string Status,
    List<ProductVariantUpdateDto>? Variants,
    List<ProductImageUpdateDto>? Images
) : IRequest<ProductDto?>;

public record ProductVariantUpdateDto(
    long? Id,
    string Sku,
    string? Name,
    decimal Price,
    decimal? CompareAtPrice,
    int StockQty,
    int? WeightGrams,
    bool IsDeleted = false
);

public record ProductImageUpdateDto(
    long? Id,
    string? Url,
    bool IsPrimary,
    int SortOrder,
    bool IsDeleted = false
);

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    private readonly AppDbContext _context;

    public UpdateProductHandler(IProductRepository productRepository, AppDbContext context)
    {
        _productRepository = productRepository;
        _context = context;
    }

    public async Task<ProductDto?> Handle(UpdateProductCommand c, CancellationToken ct)
    {
        var product = await _context.Products
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == c.Id, ct);

        if (product is null) return null;

        // Update basic product info
        product.Name = c.Name.Trim();
        product.Slug = c.Slug.Trim();
        product.BrandId = c.BrandId;
        product.CategoryId = c.CategoryId;
        product.Description = c.Description;
        product.Status = c.Status;
        product.UpdatedAt = DateTimeOffset.UtcNow;

        // Update variants if provided
        if (c.Variants != null)
        {
            await UpdateVariants(product, c.Variants, ct);
        }

        // Update images if provided
        if (c.Images != null)
        {
            await UpdateImages(product, c.Images, ct);
        }

        _productRepository.Update(product);
        await _productRepository.SaveChangesAsync(ct);

        return await _productRepository.GetByIdAsync(c.Id, true, ct);
    }

    private async Task UpdateVariants(Product product, List<ProductVariantUpdateDto> variantDtos, CancellationToken ct)
    {
        // Delete variants marked for deletion
        var variantsToDelete = variantDtos.Where(v => v.IsDeleted && v.Id.HasValue).ToList();
        foreach (var variantToDelete in variantsToDelete)
        {
            var existingVariant = product.Variants.FirstOrDefault(v => v.Id == variantToDelete.Id);
            if (existingVariant != null)
            {
                product.Variants.Remove(existingVariant);
            }
        }

        // Update or create variants
        var variantsToProcess = variantDtos.Where(v => !v.IsDeleted).ToList();
        foreach (var variantDto in variantsToProcess)
        {
            if (variantDto.Id.HasValue && variantDto.Id > 0)
            {
                // Update existing variant
                var existingVariant = product.Variants.FirstOrDefault(v => v.Id == variantDto.Id);
                if (existingVariant != null)
                {
                    existingVariant.Sku = variantDto.Sku;
                    existingVariant.Name = variantDto.Name;
                    existingVariant.Price = variantDto.Price;
                    existingVariant.CompareAtPrice = variantDto.CompareAtPrice;
                    existingVariant.StockQty = variantDto.StockQty;
                    existingVariant.WeightGrams = variantDto.WeightGrams;
                    existingVariant.UpdatedAt = DateTimeOffset.UtcNow;
                }
            }
            else
            {
                // Create new variant
                var newVariant = new Variant
                {
                    ProductId = product.Id,
                    Sku = variantDto.Sku,
                    Name = variantDto.Name,
                    Price = variantDto.Price,
                    CompareAtPrice = variantDto.CompareAtPrice,
                    StockQty = variantDto.StockQty,
                    WeightGrams = variantDto.WeightGrams,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };
                product.Variants.Add(newVariant);
            }
        }
    }

    private async Task UpdateImages(Product product, List<ProductImageUpdateDto> imageDtos, CancellationToken ct)
    {
        // Delete images marked for deletion
        var imagesToDelete = imageDtos.Where(i => i.IsDeleted && i.Id.HasValue).ToList();
        foreach (var imageToDelete in imagesToDelete)
        {
            var existingImage = product.Images.FirstOrDefault(i => i.Id == imageToDelete.Id);
            if (existingImage != null)
            {
                // Remove from Cloudinary if needed
                // await _cloudinary.DeleteImageAsync(existingImage.Url);
                product.Images.Remove(existingImage);
            }
        }

        // Update existing images (mainly for primary and sort order changes)
        var imagesToUpdate = imageDtos.Where(i => !i.IsDeleted && i.Id.HasValue && i.Id > 0).ToList();
        
        // First, reset all primary flags if we have a new primary
        if (imagesToUpdate.Any(i => i.IsPrimary))
        {
            foreach (var existingImage in product.Images)
            {
                existingImage.IsPrimary = false;
            }
        }

        foreach (var imageDto in imagesToUpdate)
        {
            var existingImage = product.Images.FirstOrDefault(i => i.Id == imageDto.Id);
            if (existingImage != null)
            {
                existingImage.IsPrimary = imageDto.IsPrimary;
                existingImage.SortOrder = imageDto.SortOrder;
            }
        }
    }
}