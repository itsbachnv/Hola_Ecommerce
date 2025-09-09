using Ecommer.Domain;
using Ecommer.Application.Abstractions.Categories;
using Ecommer.Application.Categories.Dtos;
using MediatR;


public record GetCategoryByIdQuery(long Id) : IRequest<CategoryDto?>;

public class GetCategoryByIdHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto?>
{
    private readonly ICategoryRepository _repo;

    public GetCategoryByIdHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<CategoryDto?> Handle(GetCategoryByIdQuery q, CancellationToken ct)
    {
        var category = await _repo.GetByIdAsync(q.Id);
        return category?.ToDto();
    }
}
