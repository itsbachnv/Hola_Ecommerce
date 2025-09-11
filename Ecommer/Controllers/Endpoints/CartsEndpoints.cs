using Ecommer.Application.Carts;
using Ecommer.Application.Carts.Queries;
using MediatR;

namespace Ecommer.Controllers.Endpoints;

public static class CartsEndpoints
{
    public static IEndpointRouteBuilder MapCarts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/carts").WithTags("Carts");

        // POST: /carts/add
        group.MapPost("/add", async (ISender sender, AddToCartCommand command, CancellationToken ct) =>
        {
            var cart = await sender.Send(command, ct);
            return Results.Ok(cart);
        });
        
        /*group.MapGet("/{userId:long}", async (ISender sender, long userId, CancellationToken ct) =>
        {
            var query = new GetCartByUserIdQuery(userId);
            var result = await sender.Send(query, ct);
            
            return Results.Ok(result.Value) : Results.NotFound(result.Error);
        });*/
        
        return app;
    }
}