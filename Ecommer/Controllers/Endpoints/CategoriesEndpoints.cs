using Ecommer.Application.Categories.Commands;
using MediatR;

namespace Ecommer.Api.Endpoints;

public static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategories(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/categories").WithTags("Categories");

        // GET: /categories/{id}
        group.MapGet("/{id:long}", async (long id, ISender m, CancellationToken ct) =>
        {
            var dto = await m.Send(new GetCategoryByIdQuery(id), ct);
            return dto is not null ? Results.Ok(dto) : Results.NotFound();
        });

        // GET: /categories
        group.MapGet("/", async (ISender m, CancellationToken ct) =>
        {
            var dtos = await m.Send(new ListCategoriesQuery(), ct);
            return Results.Ok(dtos);
        });

        // POST: /categories
        group.MapPost("/", async (CreateCategoryCommand cmd, ISender m, CancellationToken ct) =>
        {
            var dto = await m.Send(cmd, ct);
            return Results.Created($"/categories/{dto.Id}", dto);
        }).RequireAuthorization("AdminPolicy");

        // PUT: /categories/{id}
        group.MapPut("/{id:long}", async (long id, UpdateCategoryCommand cmd, ISender m, CancellationToken ct) =>
        {
            if (id != cmd.Id) return Results.BadRequest("Id mismatch");

            var dto = await m.Send(cmd, ct);
            return dto is not null ? Results.Ok(dto) : Results.NotFound();
        }).RequireAuthorization("AdminPolicy");;

        // DELETE: /categories/{id}
        group.MapDelete("/{id:long}", async (long id, ISender m, CancellationToken ct) =>
        {
            var result = await m.Send(new DeleteCategoryCommand(id), ct);
            return result ? Results.NoContent() : Results.NotFound();
        }).RequireAuthorization("AdminPolicy");;

        return app;
    }
}