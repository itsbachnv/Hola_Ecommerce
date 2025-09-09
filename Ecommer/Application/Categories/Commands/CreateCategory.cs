using Ecommer.Application.Abstractions.Categories;
using Ecommer.Application.Categories.Dtos;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Categories.Commands;

public record CreateCategoryCommand(
    string Name,
    string Slug,
    long? ParentId,
    string? Path
) : IRequest<CategoryDto>;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly ICategoryRepository _repo;

    public CreateCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand c, CancellationToken ct)
    {
        // Rule nhẹ: slug unique
        if (await _repo.SlugExistsAsync(c.Slug, null, ct))
            throw new InvalidOperationException("Slug already exists");

        var entity = new Category
        {
            Name = c.Name.Trim(),
            Slug = c.Slug.Trim(),
            ParentId = c.ParentId,
            Path = c.Path
        };

        await _repo.AddAsync(entity);
        return entity.ToDto();
    }
}