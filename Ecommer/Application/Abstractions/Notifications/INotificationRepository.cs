using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Notifications;

public interface INotificationsRepository
{
    Task<List<Notification>> GetAllNotificationsForUserAsync(int userId, CancellationToken cancellationToken);
        
    Task AddAsync(Notification notification, CancellationToken ct);

    Task MarkAsSentAsync(int notificationId, CancellationToken ct);
    Task MarkAllAsSentAsync(int userId, CancellationToken ct);

    Task SendNotificationAsync(Notification notification, CancellationToken ct);
    Task<int> CountUnreadNotificationsAsync(int userId, CancellationToken cancellationToken);
}