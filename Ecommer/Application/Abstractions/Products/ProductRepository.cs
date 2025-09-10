// Infrastructure/Repositories/ProductRepository.cs

using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Abstractions.Cloudary;
using Ecommer.Application.Products.Dtos;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Abstractions.Products;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;
    private readonly ICloudinaryService _cloudinary;

    public ProductRepository(AppDbContext context, ICloudinaryService cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }

    public Task<Product?> FindAsync(long id, CancellationToken ct = default) =>
        _context.Products.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<ProductDto?> GetByIdAsync(long id, bool isAdmin = false, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        return product?.ToDto(isAdmin);
    }

    public async Task AddAsync(Product entity, CancellationToken ct = default)
    {
        entity.CreatedAt = DateTimeOffset.UtcNow;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        await _context.Products.AddAsync(entity, ct);
    }

    public void Update(Product entity)
    {
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        _context.Products.Update(entity);
    }

    public void Remove(Product entity) => _context.Products.Remove(entity);

    public Task<bool> SlugExistsAsync(string slug, long? excludeId = null, CancellationToken ct = default) =>
        _context.Products.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), ct);

    public Task<ProductDto?> GetBySlugAsync(string slug, bool isAdmin = false, CancellationToken ct = default)
    {
        return _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .Where(p => p.Slug == slug)
            .Select(p => p.ToDto(isAdmin))
            .FirstOrDefaultAsync(ct);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _context.SaveChangesAsync(ct);

    public async Task<PagedResult<ProductDto>> ListAsync(
        string? search,
        long? brandId,
        long? categoryId,
        string? status,
        string? sort,
        int page,
        int pageSize,
        bool isAdmin = false,
        CancellationToken ct = default)
    {
        // Chuẩn hóa paging
        if (page < 1) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 200) pageSize = 200;

        IQueryable<Product> query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s) ||
                (p.Description != null && p.Description.ToLower().Contains(s)) ||
                p.Slug.ToLower().Contains(s));
        }

        // Filters
        if (brandId.HasValue)
            query = query.Where(p => p.BrandId == brandId);
        
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);
        
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(p => p.Status == status);

        // Non-admin chỉ xem được products có status Active
        if (!isAdmin)
        {
            query = query.Where(p => p.Status == "ACTIVE");
        }

        // Sort
        query = (sort ?? string.Empty).ToLowerInvariant() switch
        {
            "name_asc" => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            "oldest" => query.OrderBy(p => p.CreatedAt),
            "updated" => query.OrderByDescending(p => p.UpdatedAt),
            _ => query.OrderByDescending(p => p.Id)
        };

        // Total + page data
        var total = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var productDtos = items.Select(p => p.ToDto(isAdmin)).ToList();

        return new PagedResult<ProductDto>(productDtos, total, page, pageSize);
    }

    public async Task<string> UploadImageAsync(long productId, IFormFile file, CancellationToken ct = default)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productId, ct);
        
        if (product == null) 
            throw new KeyNotFoundException("Product not found");

        // Upload lên Cloudinary
        var imageUrl = await _cloudinary.UploadImageAsync(file, "product-images");

        // Lưu vào DB
        var image = new ProductImage
        {
            ProductId = productId,
            Url = imageUrl,
            IsPrimary = !product.Images.Any()
        };

        product.Images.Add(image);
        await _context.SaveChangesAsync(ct);

        return imageUrl;
    }

    public async Task<bool> RemoveImageAsync(long productId, string imageUrl, CancellationToken ct = default)
    {
        var image = await _context.Set<ProductImage>()
            .FirstOrDefaultAsync(i => i.ProductId == productId && i.Url == imageUrl, ct);

        if (image == null)
            return false;

        // Xóa từ Cloudinary
        await _cloudinary.DeleteImageAsync(imageUrl);

        // Xóa từ DB
        _context.Set<ProductImage>().Remove(image);
        await _context.SaveChangesAsync(ct);

        return true;
    }
}
