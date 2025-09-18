using Application.Interfaces;
using Application.Usecases.Guests.ViewAllGuestCommand;
using Ecommer.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HDMS_API.Infrastructure.Repositories
{
    public class GuestRepository : IGuestRepository
    {
        private readonly AppDbContext _context;
        public GuestRepository(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task<List<GuestChatDto>> GetAllGuestsAsync()
        {
            return await _context.GuestInfos
                .OrderByDescending(g => g.LastMessageAt)
                .Select(g => new GuestChatDto
                {
                    GuestId = g.GuestId,
                    Name = g.Name,
                    PhoneNumber = g.PhoneNumber,
                    Email = g.Email,
                    LastMessageAt = g.LastMessageAt,
                    Status = g.Status
                })
                .ToListAsync();
        }
    }
}
