using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Users.Dtos;
using MediatR;

namespace Ecommer.Application.Users.Queries;

public record ListUsers(
    string? Search,
    string? Role,
    string? Sort,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<UserDto>>, IPagedQuery;

public class ListUsersHandler(IUserRepository repo) : IRequestHandler<ListUsers, PagedResult<UserDto>>
{
    public Task<PagedResult<UserDto>> Handle(ListUsers q, CancellationToken ct) =>
        repo.ListAsync(q.Search, q.Role, q.Sort, q.Page, q.PageSize, ct);
}