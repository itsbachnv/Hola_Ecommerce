using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Users.Dtos;
using MediatR;

namespace Ecommer.Application.Users.Queries;

public record GetUserByIdQuery(long Id) : IRequest<UserDto>;

public class GetUserByIdHandler(IUserRepository repo) : IRequestHandler<GetUserByIdQuery, UserDto>
{
    public async Task<UserDto> Handle(GetUserByIdQuery q, CancellationToken ct)
    {
        var user = await repo.FindAsync(q.Id, ct) ?? throw new KeyNotFoundException("User not found");
        return user.ToDto();
    }
}