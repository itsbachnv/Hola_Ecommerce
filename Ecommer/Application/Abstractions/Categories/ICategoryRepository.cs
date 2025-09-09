using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Categories;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(long id);
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category> AddAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task<bool> DeleteAsync(long id);
    
    Task<bool> SlugExistsAsync(string slug, long? excludeId = null, CancellationToken ct = default);
}