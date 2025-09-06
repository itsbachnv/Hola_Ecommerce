using Ecommer.Application.Abstractions.Users;
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
            // Lấy thông tin người dùng từ username
            var user = await _userRepository.FindByEmailAsync(request.Email, cancellationToken);

            // Kiểm tra user không tồn tại hoặc bị vô hiệu hóa
            if (user == null)
            {
                throw new Exception("Sai tên đăng nhập hoặc mật khẩu"); // Sai tên đăng nhập hoặc mật khẩu
            }

            if (user.IsActive == false)
            {
                throw new Exception("Tài khoản của bạn đã bị khóa"); // Tài khoản của bạn đã bị khóa
            }

            // Xác minh mật khẩu
            var isPasswordValid = _userRepository.Verify(request.Password, user.PasswordHash ?? "");
            if (!isPasswordValid)
            {
                throw new Exception("Sai mật khẩu"); // Sai mật khẩu
            }

            // Lấy role của người dùng

            // Tạo access token và refresh token
            var accessToken = _jwtService.GenerateJWTToken(user, user.Role);
            var refreshToken = _jwtService.GenerateRefreshToken(user.Id.ToString());

            // Trả về kết quả đăng nhập thành công
            return new LoginResultDto
            {
                Success = true,
                Token = accessToken,
                refreshToken = refreshToken,
                Role = user.Role
            };
        }
    }