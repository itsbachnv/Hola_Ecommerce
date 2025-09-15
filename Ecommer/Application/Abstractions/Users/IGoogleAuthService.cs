namespace Ecommer.Application.Abstractions.Users;

public interface IGoogleAuthService
{
    Task<string?> HandleGoogleCallbackAsync(HttpContext httpContext, CancellationToken cancellation);
}