using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Abstractions.Categories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;
    private readonly DbSet<Category> _categories;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
        _categories = context.Set<Category>();
    }

    public async Task<Category?> GetByIdAsync(long id)
    {
        return await _categories.FindAsync(id);
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _categories.ToListAsync();
    }

    public async Task<Category> AddAsync(Category category)
    {
        category.CreatedAt = DateTimeOffset.UtcNow;
        category.UpdatedAt = DateTimeOffset.UtcNow;
        _categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        category.UpdatedAt = DateTimeOffset.UtcNow;
        _categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var category = await _categories.FindAsync(id);
        if (category == null) return false;
        _categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    public Task<bool> SlugExistsAsync(string slug, long? excludeId = null, CancellationToken ct = default) =>
        _context.Categories.AnyAsync(p => p.Slug == slug && (excludeId == null || p.Id != excludeId), ct);
}