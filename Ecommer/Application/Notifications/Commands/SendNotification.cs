using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Notifications;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Notifications.Commands;

public record SendNotificationCommand(
    string? Title,
    string? Message,
    string? Type,
    string? MappingUrl,
    string? RelatedObjectType,
    long? RelatedObjectId,
    IEnumerable<long> RecipientUserIds
) : IRequest<long>;

public class SendNotificationHandler : IRequestHandler<SendNotificationCommand, long>
{
    private readonly INotificationRepository _repo;
    private readonly IAppNotificationPublisher _appNotificationPublisher;

    public SendNotificationHandler(INotificationRepository repo, IAppNotificationPublisher appNotificationPublisher)
    {
        _repo = repo;
        _appNotificationPublisher = appNotificationPublisher;
    }

    public async Task<long> Handle(SendNotificationCommand cmd, CancellationToken ct)
    {
        // 1) Tạo notification (metadata + content)
        var notification = new Notification
        {
            Title = cmd.Title,
            Message = cmd.Message,
            Type = cmd.Type,
            MappingUrl = cmd.MappingUrl,
            RelatedObjectType = cmd.RelatedObjectType,
            RelatedObjectId = cmd.RelatedObjectId,
            CreatedAt = DateTime.UtcNow
        };

        // 2) Thêm recipients (distinct để tránh trùng) – chưa lưu DB
        foreach (var uid in cmd.RecipientUserIds.Distinct())
        {
            notification.Recipients.Add(new NotificationRecipient { UserId = uid });
        }

        // 3) Lưu DB (transaction nội bộ trong SaveChanges)
        await _repo.AddAsync(notification, ct);
        await _repo.SaveChangesAsync(ct);

        // 4) Gửi realtime/push (nếu có, non-blocking best effort)
        // Bạn có thể try/catch để không ảnh hưởng transaction
        await _appNotificationPublisher.PublishAsync(
            notification.Id,
            notification.Title,
            notification.Message,
            notification.Type,
            notification.MappingUrl,
            notification.RelatedObjectType,
            notification.RelatedObjectId,
            notification.Recipients.Select(r => r.UserId),
            ct
        );

        return notification.Id;
    }
}