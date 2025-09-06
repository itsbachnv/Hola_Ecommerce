using Ecommer.Application.Abstractions.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace Ecommer.Infrastructure.Notifications;

public class SignalRAppNotificationPublisher : IAppNotificationPublisher
{
    private readonly IHubContext<NotificationsHub> _hub;

    public SignalRAppNotificationPublisher(IHubContext<NotificationsHub> hub)
    {
        _hub = hub;
    }

    public async Task PublishAsync(
        long notificationId,
        string? title,
        string? message,
        string? type,
        string? mappingUrl,
        string? relatedObjectType,
        long? relatedObjectId,
        IEnumerable<long> recipientUserIds,
        CancellationToken ct = default)
    {
        // Gửi tới từng user group
        var payload = new
        {
            id = notificationId,
            title,
            message,
            type,
            mappingUrl,
            relatedObjectType,
            relatedObjectId,
            createdAt = DateTime.UtcNow
        };

        // Fan-out: gửi song song cho nhanh
        var tasks = recipientUserIds
            .Select(uid => _hub.Clients.Group(NotificationsHub.UserGroup(uid.ToString()))
                .SendAsync("notification:new", payload, ct));

        await Task.WhenAll(tasks);
    }
}