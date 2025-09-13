using System.Security.Claims;
using AutoMapper;
using Ecommer.Application.Abstractions.Notifications;
using Ecommer.Application.Notifications.Dtos;
using MediatR;

namespace Ecommer.Application.Notifications.Queries;

public class ViewNotificationQuery: IRequest<List<ViewNotificationDto>>
{
}
public class ViewNotificationHandler : IRequestHandler<ViewNotificationQuery, List<ViewNotificationDto>>
{
    private readonly INotificationsRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IMapper _mapper;

    public ViewNotificationHandler(
        INotificationsRepository repository,
        IHttpContextAccessor httpContextAccessor,
        IMapper mapper)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
        _mapper = mapper;
    }

    public async Task<List<ViewNotificationDto>> Handle(ViewNotificationQuery request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            throw new UnauthorizedAccessException("Phiên làm việc đã hết hạn");

        var userId = int.Parse(userIdClaim.Value);

        var entities = await _repository.GetAllNotificationsForUserAsync(userId, cancellationToken);
        return _mapper.Map<List<ViewNotificationDto>>(entities);
    }
}

public class ViewNotificationCommand
{
}