using Ecommer.Application.Abstractions.Users;
using Ecommer.Domain;
using HDMS_API.Application.Usecases.UserCommon.Login;
using MediatR;

namespace Ecommer.Application.Users.Commands;

public class LoginCommand : IRequest<LoginResultDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class LoginHandler : IRequestHandler<LoginCommand, LoginResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public LoginHandler(IUserRepository userRepository, IJwtService jwtService)
    {
        _jwtService = jwtService;
        _userRepository = userRepository;
    }

    public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await GetUserAsync(request.Email, cancellationToken);
        ValidateUser(user, request.Password);

        var accessToken = _jwtService.GenerateJWTToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id.ToString());

        return new LoginResultDto
        {
            Success = true,
            Token = accessToken,
            FullName = user.FullName ?? user.Email,
            refreshToken = refreshToken,
            Role = user.Role,
            UserId = user.Id
        };
    }

    private async Task<User> GetUserAsync(string email, CancellationToken cancellationToken)
    {
        var user = await _userRepository.FindByEmailAsync(email, cancellationToken);
        if (user == null)
        {
            throw new Exception("Sai tên đăng nhập hoặc mật khẩu");
        }
        return user;
    }

    private void ValidateUser(User user, string password)
    {
        if (!user.IsActive)
        {
            throw new Exception("Tài khoản của bạn đã bị khóa");
        }

        var isPasswordValid = _userRepository.Verify(password, user.PasswordHash ?? "");
        if (!isPasswordValid)
        {
            throw new Exception("Sai mật khẩu");
        }
    }
}
