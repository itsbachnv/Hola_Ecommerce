using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Variants;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Abstractions.Variants;

public class VariantRepository : IVariantRepository
{
    private readonly AppDbContext _context;

    public VariantRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Variant?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Variant>()
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<Variant?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Variant>()
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Sku == sku, cancellationToken);
    }

    public async Task<IPagedResult<Variant>> GetPagedAsync(IPagedQuery query, bool isAdmin = false, CancellationToken cancellationToken = default)
    {
        var queryable = _context.Set<Variant>()
            .Include(v => v.Product)
            .AsQueryable();

        if (!isAdmin)
        {
            queryable = queryable.Where(v => v.StockQty > 0);
        }

        var totalCount = await queryable.CountAsync(cancellationToken);
        
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Variant>(items, totalCount, query.Page, query.PageSize);
    }

    public async Task<IEnumerable<Variant>> GetByProductIdAsync(long productId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Variant>()
            .Where(v => v.ProductId == productId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Variant> CreateAsync(Variant variant, CancellationToken cancellationToken = default)
    {
        variant.CreatedAt = DateTimeOffset.UtcNow;
        variant.UpdatedAt = DateTimeOffset.UtcNow;
        
        _context.Set<Variant>().Add(variant);
        await _context.SaveChangesAsync(cancellationToken);
        return variant;
    }

    public async Task<Variant> UpdateAsync(Variant variant, CancellationToken cancellationToken = default)
    {
        variant.UpdatedAt = DateTimeOffset.UtcNow;
        
        _context.Set<Variant>().Update(variant);
        await _context.SaveChangesAsync(cancellationToken);
        return variant;
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var variant = await _context.Set<Variant>().FindAsync(id, cancellationToken);
        if (variant != null)
        {
            _context.Set<Variant>().Remove(variant);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<bool> ExistsAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Variant>().AnyAsync(v => v.Id == id, cancellationToken);
    }

    public async Task<bool> SkuExistsAsync(string sku, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Set<Variant>().Where(v => v.Sku == sku);
        
        if (excludeId.HasValue)
        {
            query = query.Where(v => v.Id != excludeId.Value);
        }
        
        return await query.AnyAsync(cancellationToken);
    }
}
