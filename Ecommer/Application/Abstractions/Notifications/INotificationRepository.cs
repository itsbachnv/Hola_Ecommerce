using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Notifications;

public interface INotificationRepository
{
    Task AddAsync(Notification entity, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}