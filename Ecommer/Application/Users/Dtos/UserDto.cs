namespace Ecommer.Application.Users.Dtos;

public record UserDto(
    long Id,
    string Email,
    string? FullName,
    string? Role,
    bool IsActive,
    DateTimeOffset CreatedAt
);