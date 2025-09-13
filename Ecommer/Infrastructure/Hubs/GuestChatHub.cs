using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.AspNetCore.SignalR;
using Infrastructure.Realtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Hubs;

[AllowAnonymous]
public class GuestChatHub : Hub
{
    private readonly AppDbContext _context;

    public GuestChatHub(AppDbContext context)
    {
        _context = context;
    }
    
    public override System.Threading.Tasks.Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var guestId = httpContext?.Request.Query["guestId"].ToString();

        if (!string.IsNullOrEmpty(guestId))
        {
            Console.WriteLine($"✅ Guest connected with guestId: {guestId}");
            GuestConnectionManager.AddConnection(guestId, Context.ConnectionId);
        }
        else
        {
            Console.WriteLine($"⚠️ Guest connected but guestId missing, fallback to ConnectionId: {Context.ConnectionId}");
        }

        return base.OnConnectedAsync();
    }

    public override System.Threading.Tasks.Task OnDisconnectedAsync(Exception? exception)
    {
        var httpContext = Context.GetHttpContext();
        var guestId = httpContext?.Request.Query["guestId"].ToString();

        if (!string.IsNullOrEmpty(guestId))
        {
            GuestConnectionManager.RemoveConnection(guestId, Context.ConnectionId);
        }

        return base.OnDisconnectedAsync(exception);
    }

    // Guest gửi tin nhắn tới consultant
    public async System.Threading.Tasks.Task SendMessageToConsultant(string receiverId, string message)
    {
        var httpContext = Context.GetHttpContext();
        var guestId = httpContext?.Request.Query["guestId"].ToString() ?? Context.ConnectionId;
        var timestamp = DateTime.Now;

        var guest = await _context.GuestInfos.FirstOrDefaultAsync(x => x.GuestId.ToString() == guestId);
        if (guest == null)
        {
            guest = new GuestInfo
            {
                GuestId = Guid.Parse(guestId),
                Name = await GenerateUniqueAnonymousNameAsync(),
                LastMessageAt = DateTime.Now
            };
            _context.GuestInfos.Add(guest);
        }
        else
        {
            guest.LastMessageAt = DateTime.Now;
        }
        
        // Save message to database
        var chatMessage = new ChatMessage
        {
            SenderId = guestId,
            ReceiverId = receiverId,
            Message = message,
            Timestamp = timestamp
        };
        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        // Send message to consultant(s)
        var consultantConnections = GuestConnectionManager.GetConnections(receiverId);
        foreach (var connId in consultantConnections)
        {
            await Clients.Client(connId).SendAsync("ReceiveMessage", guestId, message, receiverId, timestamp.ToString("o"));
        }

        // Optionally, send confirmation to guest
        await Clients.Caller.SendAsync("MessageSent", chatMessage.Id);
    }
    private async System.Threading.Tasks.Task<string> GenerateUniqueAnonymousNameAsync()
    {
        string baseName = "Anonymous";
        int suffix = 1;
        string candidate;
    
        do
        {
            candidate = $"{baseName} {suffix}";
            suffix++;
        } while (await _context.GuestInfos.AnyAsync(g => g.Name == candidate));
    
        return candidate;
    }
}