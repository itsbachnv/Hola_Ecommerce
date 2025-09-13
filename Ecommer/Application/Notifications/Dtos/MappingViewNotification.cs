using AutoMapper;
using Ecommer.Application.Notifications.Dtos;
using Ecommer.Domain;

namespace Ecommer.Application.Notifications.Dtos
{
    public class MappingViewNotification : Profile
    {
        public MappingViewNotification()
        {
            CreateMap<Notification, ViewNotificationDto>();
        }
    }
}
