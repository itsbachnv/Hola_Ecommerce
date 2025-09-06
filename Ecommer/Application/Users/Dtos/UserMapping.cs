using Ecommer.Domain;

namespace Ecommer.Application.Users.Dtos;

public static class UserMapping
{
    public static UserDto ToDto(this User u) =>
        new UserDto(u.Id, u.Email, u.FullName, u.Role, u.IsActive, u.CreatedAt);
}