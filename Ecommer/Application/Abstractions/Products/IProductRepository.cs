// Application/Abstractions/IProductRepository.cs

using Ecommer.Application.Products.Dtos;

namespace Ecommer.Application.Abstractions;

using Ecommer.Domain;

public interface IProductRepository
{
    Task<Product?> FindAsync(long id, CancellationToken ct = default);
    Task AddAsync(Product entity, CancellationToken ct = default);
    void Update(Product entity);
    void Remove(Product entity);

    Task<bool> SlugExistsAsync(string slug, long? excludeId = null, CancellationToken ct = default);

    Task<int> SaveChangesAsync(CancellationToken ct = default);
    
    Task<PagedResult<ProductDto>> ListAsync(
        string? search,
        long? brandId,
        long? categoryId,
        string? status,
        string? sort,
        int page,
        int pageSize,
        CancellationToken ct = default);
}