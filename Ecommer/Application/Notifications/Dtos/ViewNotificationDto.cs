namespace Ecommer.Application.Notifications.Dtos;

public class ViewNotificationDto
{
    public int NotificationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? RelatedObjectId { get; set; }
    public string? MappingUrl { get; set; } = null;
}