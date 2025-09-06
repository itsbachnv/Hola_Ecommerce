using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Ecommer.Infrastructure.Notifications;

[Authorize]
public class NotificationsHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value
                     ?? Context.UserIdentifier
                     ?? Context.User?.FindFirst("uid")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? ex)
    {
        var userId = Context.User?.FindFirst("sub")?.Value
                     ?? Context.UserIdentifier
                     ?? Context.User?.FindFirst("uid")?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserGroup(userId));
        }

        await base.OnDisconnectedAsync(ex);
    }

    public static string UserGroup(string userId) => $"user:{userId}";
}