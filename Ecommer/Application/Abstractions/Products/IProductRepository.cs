// Application/Abstractions/IProductRepository.cs

using Ecommer.Application.Abstractions;
using Ecommer.Application.Products.Dtos;
using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Products;

public interface IProductRepository
{
    Task<Product?> FindAsync(long id, CancellationToken ct = default);
    Task<ProductDto?> GetByIdAsync(long id, bool isAdmin = false, CancellationToken ct = default);
    Task<PagedResult<ProductDto>> ListAsync(
        string? search, 
        long? brandId, 
        long? categoryId, 
        string? status, 
        string? sort, 
        int page, 
        int pageSize, 
        bool isAdmin = false,
        CancellationToken ct = default);
    Task AddAsync(Product entity, CancellationToken ct = default);
    void Update(Product entity);
    void Remove(Product entity);
    Task<bool> SlugExistsAsync(string slug, long? excludeId = null, CancellationToken ct = default);
    Task<ProductDto?> GetBySlugAsync(string slug, bool isAdmin = false, CancellationToken ct = default);
    bool GetByNameAsync(string slug, bool isAdmin = false, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task<string> UploadImageAsync(long productId, IFormFile file, bool isPrimary = false, CancellationToken ct = default);
    Task<List<string>> UploadImagesAsync(long productId, IFormFileCollection files, List<int> sortOrders, List<bool> isPrimaryFlags, CancellationToken ct = default);
    Task<bool> RemoveImageAsync(long productId, string imageUrl, CancellationToken ct = default);
    Task<bool> SetPrimaryImageAsync(long productId, string imageUrl, CancellationToken ct = default);
}