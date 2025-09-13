namespace Ecommer.Application.Notifications.Dtos;

public record NotificationDto(
    int      NotificationId,
    string?  Title,
    string?  Message,
    string?  NotificationType,
    bool     IsRead,
    DateTime?  CreatedAt,
    int?     RelatedObjectId,
    string?  MappingUrl);