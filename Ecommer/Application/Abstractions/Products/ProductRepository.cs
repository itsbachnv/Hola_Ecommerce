// Infrastructure/Repositories/ProductRepository.cs

using Ecommer.Application.Products.Dtos;

namespace Ecommer.Infrastructure.Repositories;

using Ecommer.Application.Abstractions;
using Ecommer.Domain;
using Microsoft.EntityFrameworkCore;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;
    public ProductRepository(AppDbContext db) => _db = db;

    public Task<Product?> FindAsync(long id, CancellationToken ct = default) =>
        _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task AddAsync(Product entity, CancellationToken ct = default) =>
        await _db.Products.AddAsync(entity, ct);

    public void Update(Product entity) => _db.Products.Update(entity);

    public void Remove(Product entity) => _db.Products.Remove(entity);

    public Task<bool> SlugExistsAsync(string slug, long? excludeId = null, CancellationToken ct = default) =>
        _db.Products.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);
    public async Task<PagedResult<ProductDto>> ListAsync(
        string? search,
        long? brandId,
        long? categoryId,
        string? status,
        string? sort,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        // Chuẩn hóa paging
        if (page < 1) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 200) pageSize = 200; // chặn quá lớn

        IQueryable<Product> query = _db.Products.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            // ILIKE (PostgreSQL) – nếu bạn dùng SQL Server hãy đổi sang ToLower/Contains
            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{s}%") ||
                EF.Functions.ILike(p.Slug, $"%{s}%"));
        }

        // Filters
        if (brandId is not null)    query = query.Where(p => p.BrandId == brandId);
        if (categoryId is not null) query = query.Where(p => p.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(p => p.Status == status);

        // Sort
        query = (sort ?? string.Empty).ToLowerInvariant() switch
        {
            "name_asc"  => query.OrderBy(p => p.Name),
            "name_desc" => query.OrderByDescending(p => p.Name),
            "newest"    => query.OrderByDescending(p => p.UpdatedAt),
            "oldest"    => query.OrderBy(p => p.UpdatedAt),
            _           => query.OrderByDescending(p => p.Id) // default
        };

        // Total + page data
        var total = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => p.ToDto()) // giả định có extension ToDto()
            .ToListAsync(ct);

        return new PagedResult<ProductDto>(items, total, page, pageSize);
    }
}