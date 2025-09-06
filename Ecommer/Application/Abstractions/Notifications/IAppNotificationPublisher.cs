namespace Ecommer.Application.Abstractions.Notifications;

public interface IAppNotificationPublisher
{
    Task PublishAsync(
        long notificationId,
        string? title,
        string? message,
        string? type,
        string? mappingUrl,
        string? relatedObjectType,
        long? relatedObjectId,
        IEnumerable<long> recipientUserIds,
        CancellationToken ct = default);
}