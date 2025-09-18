using Application.Usecases.Guests.ViewAllGuestCommand;

namespace Application.Interfaces
{
    public interface IGuestRepository
    {
        Task<List<GuestChatDto>> GetAllGuestsAsync();
    }
}
