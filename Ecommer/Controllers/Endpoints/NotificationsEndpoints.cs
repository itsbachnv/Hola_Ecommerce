using Ecommer.Application.Abstractions.Notifications;
using Ecommer.Application.Notifications.Commands;
using Ecommer.Application.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Ecommer.Controllers.Endpoints;

public static class NotificationsEndpoints
{
    public static IEndpointRouteBuilder MapNotifications(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/notifications")
            .WithTags("Notifications");

        // GET /notifications
        group.MapGet("/", async ([FromServices] IMediator mediator, CancellationToken ct) =>
            {
                var result = await mediator.Send(new ViewNotificationQuery(), ct);

                if (result == null || !result.Any())
                    return Results.Ok(new { message = "Không có thông báo nào." });

                return Results.Ok(result);
            })
            .WithSummary("Get notifications")
            .WithDescription("Retrieve all notifications for the current user")
            .RequireAuthorization();

        // POST /notifications/send
        group.MapPost("/send", async (SendNotificationCommand cmd, [FromServices] IMediator mediator, CancellationToken ct) =>
            {
                var id = await mediator.Send(cmd, ct);
                return Results.Created($"/notifications/{id}", new { id });
            })
            .WithSummary("Send a notification")
            .WithDescription("Create a notification and fan-out recipients.");

        // GET /notifications/unread-count/{userId}
        group.MapGet("/unread-count/{userId:int}", async ([FromRoute] int userId, [FromServices] IMediator mediator, CancellationToken ct, [FromServices] NotificationsRepository _notificationsRepository) =>
            {
                var count = await _notificationsRepository.CountUnreadNotificationsAsync(userId, ct);
                return Results.Ok(new { unreadCount = count });
            })
            .WithSummary("Get unread notification count")
            .RequireAuthorization();

        // PUT /notifications/mark-as-read/{notificationId}
        group.MapPut("/mark-as-read/{notificationId:int}", async (int notificationId, [FromServices] IMediator mediator, CancellationToken ct, [FromServices] NotificationsRepository _notificationsRepository) =>
            {
                await _notificationsRepository.MarkAsSentAsync(notificationId, ct);
                return Results.Ok(new { message = "Notification marked as read." });
            })
            .WithSummary("Mark a notification as read")
            .RequireAuthorization();

        // PUT /notifications/mark-all-as-read/{userId}
        group.MapPut("/mark-all-as-read/{userId:int}", async ([FromRoute] int userId, [FromServices] IMediator mediator, CancellationToken ct, [FromServices] NotificationsRepository _notificationsRepository) =>
            {
                await _notificationsRepository.MarkAllAsSentAsync(userId, ct);
                return Results.Ok(new { message = "All notifications marked as read." });
            })
            .WithSummary("Mark all notifications as read")
            .RequireAuthorization();

        return app;
    }
}
