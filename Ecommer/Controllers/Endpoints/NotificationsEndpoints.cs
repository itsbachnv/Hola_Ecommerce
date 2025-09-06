using Ecommer.Application.Notifications.Commands;
using MediatR;

namespace Ecommer.Controllers.Endpoints;

public static  class NotificationsEndpoints
{
    public static IEndpointRouteBuilder MapNotifications(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/notifications").WithTags("Notifications");

        group.MapPost("/send", async (SendNotificationCommand cmd, ISender mediator, CancellationToken ct) =>
            {
                var id = await mediator.Send(cmd, ct);
                return Results.Created($"/notifications/{id}", new { id });
            })
            .WithSummary("Send a notification to multiple users")
            .WithDescription("Create a notification and fan-out recipients.");

        return app;
    }
}