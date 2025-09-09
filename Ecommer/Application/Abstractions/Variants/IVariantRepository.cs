using Ecommer.Application.Abstractions;
using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Variants;

public interface IVariantRepository
{
    Task<Variant?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Variant?> GetBySkuAsync(string sku, CancellationToken cancellationToken = default);

    Task<IPagedResult<Variant>> GetPagedAsync(IPagedQuery query, bool isAdmin = false,
        CancellationToken cancellationToken = default);
    Task<IEnumerable<Variant>> GetByProductIdAsync(long productId, CancellationToken cancellationToken = default);
    Task<Variant> CreateAsync(Variant variant, CancellationToken cancellationToken = default);
    Task<Variant> UpdateAsync(Variant variant, CancellationToken cancellationToken = default);
    Task DeleteAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> SkuExistsAsync(string sku, long? excludeId = null, CancellationToken cancellationToken = default);
}
