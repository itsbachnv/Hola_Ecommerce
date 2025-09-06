using Ecommer.Domain;
using Ecommer.Infrastructure;

namespace Ecommer.Application.Abstractions.Notifications;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _db;
    public NotificationRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(Notification entity, CancellationToken ct = default)
        => await _db.Notifications.AddAsync(entity, ct);

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);
}