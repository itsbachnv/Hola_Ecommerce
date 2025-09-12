using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Users.Dtos;
using Ecommer.Domain;
using FluentValidation;
using MediatR;

namespace Ecommer.Application.Users.Commands;

public record RegisterCommand(
    string Email,
    string Password,
    string FullName
) : IRequest<UserDto>;

public class RegisterValidator : AbstractValidator<RegisterCommand>
{
    public RegisterValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Email is required and must be valid");
            
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6)
            .WithMessage("Password is required and must be at least 6 characters");
            
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200)
            .WithMessage("Full name is required and must be less than 200 characters");
    }
}

public class RegisterHandler(IUserRepository repo) : IRequestHandler<RegisterCommand, UserDto>
{
    public async Task<UserDto> Handle(RegisterCommand c, CancellationToken ct)
    {
        // Kiểm tra email đã tồn tại chưa
        if (await repo.EmailExistsAsync(c.Email.ToLower(), null, ct))
            throw new InvalidOperationException("Email already exists");
            
        // Hash password
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(c.Password);
        
        // Tạo user mới với role mặc định là Customer
        var user = new User
        {
            Email = c.Email.Trim(),
            FullName = c.FullName.Trim(),
            Role = "Customer", // Role mặc định là Customer
            PasswordHash = hashedPassword,
            IsActive = true, // Mặc định active
            CreatedAt = DateTime.UtcNow
        };

        await repo.AddAsync(user, ct);
        await repo.SaveChangesAsync(ct);

        return user.ToDto();
    }
}
