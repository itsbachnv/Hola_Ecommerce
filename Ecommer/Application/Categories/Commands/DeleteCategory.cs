using Ecommer.Application.Abstractions.Categories;
using MediatR;

public record DeleteCategoryCommand(long Id) : IRequest<bool>;

public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand, bool>
{
    private readonly ICategoryRepository _repo;

    public DeleteCategoryHandler(ICategoryRepository repo)
    {
        _repo = repo;
    }

    public async Task<bool> Handle(DeleteCategoryCommand c, CancellationToken ct)
    {
        return await _repo.DeleteAsync(c.Id);
    }
}
