using Ecommer.Application.Users.Commands;
using Ecommer.Application.Users.Queries;
using MediatR;

namespace Ecommer.Controllers.Endpoints;

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsers(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/users").WithTags("Users");

        g.MapGet("/{id:long}", async (long id, ISender m, CancellationToken ct) =>
        {
            var dto = await m.Send(new GetUserByIdQuery(id), ct);
            return Results.Ok(dto);
        });

        g.MapGet("/", async (string? search, string? role, string? sort, int page, int pageSize, ISender m, CancellationToken ct) =>
        {
            var result = await m.Send(new ListUsers(search, role, sort, page <= 0 ? 1 : page, pageSize <= 0 ? 20 : pageSize), ct);
            return Results.Ok(result);
        }).RequireAuthorization("AdminPolicy");

        // Register endpoint - public (không cần authorization)
        g.MapPost("/", async (RegisterCommand cmd, ISender m, CancellationToken ct) =>
        {
            try
            {
                var dto = await m.Send(cmd, ct);
                return Results.Created($"/users/{dto.Id}", dto);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });
        
        // Admin-only endpoint to create users with custom roles
        g.MapPost("/admin/create", async (CreateUserCommand cmd, ISender m, CancellationToken ct) =>
        {
            var dto = await m.Send(cmd, ct);
            return Results.Created($"/users/{dto.Id}", dto);
        }).RequireAuthorization("AdminPolicy");
        
        g.MapPost("/login", async (LoginCommand cmd, ISender m, CancellationToken ct) =>
        {
            try
            {
                var dto = await m.Send(cmd, ct);
                return Results.Ok(dto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Unauthorized();
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message);
            }
        });

        /*g.MapPut("/{id:long}", async (long id, UpdateUserCommand body, ISender m, CancellationToken ct) =>
        {
            var dto = await m.Send(body with { Id = id }, ct);
            return Results.Ok(dto);
        });

        g.MapDelete("/{id:long}", async (long id, ISender m, CancellationToken ct) =>
        {
            await m.Send(new DeleteUserCommand(id), ct);
            return Results.NoContent();
        });*/

        return app;
    }
}