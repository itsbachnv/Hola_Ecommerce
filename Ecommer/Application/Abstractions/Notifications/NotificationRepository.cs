using AutoMapper;
using Ecommer.Application.Notifications.Dtos;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Abstractions.Notifications;

public class NotificationsRepository : INotificationsRepository
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotifyHub> _hub;
        private readonly IMapper _mapper;

        public NotificationsRepository(AppDbContext context,  IHubContext<NotifyHub> hub,
            IMapper mapper)
        {
            _context = context;
            _hub   = hub;
            _mapper = mapper;
        }

        public async Task<List<Notification>> GetAllNotificationsForUserAsync(int userId, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task AddAsync(Notification n, CancellationToken ct)
        {
            try
            {
                _context.Notifications.Add(n);
                await _context.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex); 
                Console.WriteLine(ex.InnerException?.Message);
            }

        }

        public async Task MarkAsSentAsync(int id, CancellationToken ct)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == id, ct);
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync(ct);
            }
        }
        
        public async Task MarkAllAsSentAsync(int userId, CancellationToken ct)
        {
            await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(n => n.IsRead, true),
                    ct
                );
        }

        /// <summary>
        /// Gửi realtime qua SignalR + lưu DB chỉ qua 1 hàm
        /// </summary>
        public async Task SendNotificationAsync(Notification n, CancellationToken ct)
        {
            await AddAsync(n, ct); // Lưu trước để có NotificationId

            var dto = _mapper.Map<NotificationDto>(n);

            await _hub.Clients
                .User(n.UserId.ToString())
                .SendAsync("ReceiveNotification", dto, ct);
        }
        
        public async Task<int> CountUnreadNotificationsAsync(int userId, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync(cancellationToken);
        }

    }