using Application.Interfaces;
using Ecommer.Application.Abstractions.Users;
using MediatR;

namespace Application.Usecases.UserCommon.ViewAllUserChat;

public class ViewAllUsersHandler : IRequestHandler<ViewAllUsersChatCommand, List<ViewUserChatDto>>
{
    private readonly IUserRepository _userRepository;

    public ViewAllUsersHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<ViewUserChatDto>> Handle(ViewAllUsersChatCommand request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllUserAsync();

        return users.Select(u => new ViewUserChatDto()
        {
            UserId = u.Id.ToString(),
            FullName = u.FullName,
            Phone = u.Phone,
            AvatarUrl = u.Meta.ToString(),
            Role = u.Role,
        }).ToList();
    }
}
