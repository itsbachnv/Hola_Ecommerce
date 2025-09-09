using Ecommer.Domain;
using Ecommer.Application.Abstractions.Categories;
using Ecommer.Application.Categories.Dtos;
using MediatR;

public record ListCategoriesQuery() : IRequest<IEnumerable<CategoryDto>>;
public class ListCategoriesHandler : IRequestHandler<ListCategoriesQuery, IEnumerable<CategoryDto>>
{
    private readonly ICategoryRepository _repo;

    public ListCategoriesHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<CategoryDto>> Handle(ListCategoriesQuery q, CancellationToken ct)
    {
        var categories = await _repo.GetAllAsync();
        return categories.Select(c => c.ToDto());
    }
}