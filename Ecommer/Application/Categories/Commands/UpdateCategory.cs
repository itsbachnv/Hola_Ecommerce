using Ecommer.Domain;
using Ecommer.Application.Abstractions.Categories;
using Ecommer.Application.Categories.Dtos;
using MediatR;

public record UpdateCategoryCommand(
    long Id,
    string Name,
    string Slug,
    long? ParentId,
    string? Path
) : IRequest<CategoryDto?>;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto?>
{
    private readonly ICategoryRepository _repo;

    public UpdateCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<CategoryDto?> Handle(UpdateCategoryCommand c, CancellationToken ct)
    {
        var category = await _repo.GetByIdAsync(c.Id);
        if (category == null) return null;

        // Rule nhẹ: slug unique (trừ chính nó)
        if (await _repo.SlugExistsAsync(c.Slug, c.Id, ct))
            throw new InvalidOperationException("Slug already exists");

        category.Name = c.Name.Trim();
        category.Slug = c.Slug.Trim();
        category.ParentId = c.ParentId;
        category.Path = c.Path;
        category.UpdatedAt = DateTimeOffset.UtcNow;

        await _repo.UpdateAsync(category);

        return category.ToDto();
    }
}
