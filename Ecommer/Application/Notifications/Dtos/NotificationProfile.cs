using AutoMapper;
using Ecommer.Application.Notifications.Dtos;
using Ecommer.Domain;

namespace Ecommer.Application.Notifications.Dtos;

public class NotificationProfile : Profile
{
    public NotificationProfile()
    {
        CreateMap<Notification, NotificationDto>()
            .ForMember(dest => dest.CreatedAt,
                opt => opt.MapFrom(src =>
                    DateTime.SpecifyKind(src.CreatedAt, DateTimeKind.Utc).ToLocalTime()));

    }
}