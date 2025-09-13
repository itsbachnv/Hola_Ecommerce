using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Notifications;
using Ecommer.Application.Abstractions.Users;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Notifications.Commands;

public record SendNotificationCommand(
    int      UserId,
    string?  Title,
    string?  Message,
    string?  Type,
    int?     RelatedObjectId,
    string? MappingUrl) : IRequest<Unit>;

public class SendNotificationHandler : IRequestHandler<SendNotificationCommand, Unit>
{
    private readonly IServiceScopeFactory _scopeFactory;

    public SendNotificationHandler(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task<Unit> Handle(SendNotificationCommand c, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();

        var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var notificationRepo = scope.ServiceProvider.GetRequiredService<INotificationsRepository>();

        var userExists = await userRepo.FindAsync(c.UserId, ct);
        if (userExists == null)
            throw new KeyNotFoundException($"UserId {c.UserId} không tồn tại.");

        var entity = new Notification
        {
            UserId          = c.UserId,
            Title           = c.Title,
            Message         = c.Message,
            NotificationType            = c.Type,
            IsRead          = false,
            CreatedAt       = DateTime.UtcNow,
            RelatedObjectId = c.RelatedObjectId,
            MappingUrl      = c.MappingUrl
        };

        await notificationRepo.SendNotificationAsync(entity, ct);
        return Unit.Value;
    }
}