using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Users.Dtos;
using Ecommer.Domain;
using FluentValidation;
using MediatR;

namespace Ecommer.Application.Users.Commands;

public record CreateUserCommand(
    string Email,
    string? FullName,
    string? Password,
    string? Role,
    bool IsActive = true
) : IRequest<UserDto>;

public class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FullName).MaximumLength(200);
        RuleFor(x => x.Role).MaximumLength(50);
    }
}

public class CreateUserHandler(IUserRepository repo) : IRequestHandler<CreateUserCommand, UserDto>
{
    public async Task<UserDto> Handle(CreateUserCommand c, CancellationToken ct)
    {
        if (await repo.EmailExistsAsync(c.Email, null, ct))
            throw new InvalidOperationException("Email already exists");
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(c.Password);
        var user = new User
        {
            Email = c.Email.Trim(),
            FullName = c.FullName?.Trim(),
            Role = string.IsNullOrWhiteSpace(c.Role) ? "User" : c.Role!.Trim(),
            PasswordHash = hashedPassword,
            IsActive = c.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await repo.AddAsync(user, ct);
        await repo.SaveChangesAsync(ct);

        return user.ToDto();
    }
}