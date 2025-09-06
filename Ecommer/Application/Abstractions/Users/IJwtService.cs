using System.Security.Claims;
using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Users;

public interface IJwtService
{
    string GenerateJWTToken(User user, string Role);
    string GenerateRefreshToken(string userId);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token, bool isRefresh = false);
}