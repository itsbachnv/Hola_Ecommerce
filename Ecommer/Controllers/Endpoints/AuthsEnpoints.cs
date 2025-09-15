using Ecommer.Application.Abstractions.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

namespace Ecommer.Controllers.Endpoints;

public static class AuthsEndpoints
{
    public static IEndpointRouteBuilder MapAuths(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auths");

        // login-google
        group.MapGet("/login-google", LoginGoogle);

        // google-callback
        group.MapGet("/google-callback", GoogleCallback);

        return app;
    }

    private static IResult LoginGoogle(HttpContext context)
    {
        var redirectUrl = $"{context.Request.Scheme}://{context.Request.Host}/api/auth/google-callback";
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Results.Challenge(properties, new[] { GoogleDefaults.AuthenticationScheme });
    }

    private static async Task<IResult> GoogleCallback(
        [FromServices] IGoogleAuthService googleAuthService,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var redirectUrl = await googleAuthService.HandleGoogleCallbackAsync(context, cancellationToken);

        return redirectUrl == null
            ? Results.Unauthorized()
            : Results.Redirect(redirectUrl);
    }
}