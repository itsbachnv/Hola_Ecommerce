using Ecommer.Application.Carts;
using Ecommer.Application.Carts.Commands;
using Ecommer.Application.Carts.Queries;
using MediatR;
using System.Security.Claims;

namespace Ecommer.Controllers.Endpoints;

public static class CartsEndpoints
{
    public static IEndpointRouteBuilder MapCarts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/carts").WithTags("Carts");

        // POST: /carts/add
        group.MapPost("/add", async (ISender sender, AddToCartCommand command, HttpContext context, CancellationToken ct) =>
        {
            // Extract userId from JWT token if not provided in command
            if (!command.UserId.HasValue && context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (long.TryParse(userIdClaim, out var userId))
                {
                    command = command with { UserId = userId };
                }
            }
            
            var cart = await sender.Send(command, ct);
            return Results.Ok(cart);
        }).RequireAuthorization(); // Require authentication

        // PUT: /carts/items/{itemId}/toggle-selection
        group.MapPut("/items/{itemId:long}/toggle-selection", async (ISender sender, long itemId, ToggleCartItemSelectionRequest request, CancellationToken ct) =>
        {
            var command = new ToggleCartItemSelectionCommand(itemId, request.IsSelected);
            var cartItem = await sender.Send(command, ct);
            return Results.Ok(cartItem);
        });

        // PUT: /carts/{cartId}/toggle-all-selection
        group.MapPut("/{cartId:long}/toggle-all-selection", async (ISender sender, long cartId, ToggleAllCartItemsSelectionRequest request, CancellationToken ct) =>
        {
            var command = new ToggleAllCartItemsSelectionCommand(cartId, request.IsSelected);
            var cart = await sender.Send(command, ct);
            return Results.Ok(cart);
        });

        // DELETE: /carts/items/{itemId}
        group.MapDelete("/items/{itemId:long}", async (ISender sender, long itemId, HttpContext context, CancellationToken ct) =>
        {
            // Extract userId from JWT token
            long? userId = null;
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (long.TryParse(userIdClaim, out var id))
                {
                    userId = id;
                }
            }

            var command = new RemoveFromCartCommand(itemId, userId);
            var success = await sender.Send(command, ct);
            return success ? Results.Ok() : Results.NotFound();
        }).RequireAuthorization();

        // DELETE: /carts/products/{productId}/variants/{variantId}
        group.MapDelete("/products/{productId:long}/variants/{variantId:long}", async (ISender sender, long productId, long variantId, HttpContext context, CancellationToken ct) =>
        {
            // Extract userId from JWT token
            long? userId = null;
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (long.TryParse(userIdClaim, out var id))
                {
                    userId = id;
                }
            }

            var command = new RemoveFromCartByProductCommand(productId, variantId, userId);
            var success = await sender.Send(command, ct);
            return success ? Results.Ok() : Results.NotFound();
        }).RequireAuthorization();

        // PUT: /carts/items/{itemId}/quantity
        group.MapPut("/items/{itemId:long}/quantity", async (ISender sender, long itemId, UpdateQuantityRequest request, HttpContext context, CancellationToken ct) =>
        {
            // Extract userId from JWT token
            long? userId = null;
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (long.TryParse(userIdClaim, out var id))
                {
                    userId = id;
                }
            }

            var command = new UpdateCartQuantityCommand(itemId, request.Quantity, userId);
            var cartItem = await sender.Send(command, ct);
            return cartItem != null ? Results.Ok(cartItem) : Results.NotFound();
        }).RequireAuthorization();

        // PUT: /carts/products/{productId}/variants/{variantId}/quantity
        group.MapPut("/products/{productId:long}/variants/{variantId:long}/quantity", async (ISender sender, long productId, long variantId, UpdateQuantityRequest request, HttpContext context, CancellationToken ct) =>
        {
            // Extract userId from JWT token
            long? userId = null;
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (long.TryParse(userIdClaim, out var id))
                {
                    userId = id;
                }
            }

            var command = new UpdateCartQuantityByProductCommand(productId, variantId, request.Quantity, userId);
            var success = await sender.Send(command, ct);
            return success ? Results.Ok() : Results.NotFound();
        }).RequireAuthorization();

        // GET: /carts/{userId}
        group.MapGet("/{userId:long}", async (ISender sender, long userId, HttpContext context, CancellationToken ct) =>
        {
            // Extract userId from JWT token to verify ownership
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (long.TryParse(userIdClaim, out var authenticatedUserId) && authenticatedUserId != userId)
                {
                    return Results.Forbid();
                }
            }

            var query = new GetCartByUserIdQuery(userId);
            var result = await sender.Send(query, ct);
            
            return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(result.ErrorMessage);
        }).RequireAuthorization();
        
        return app;
    }
}

// Request DTOs
public record ToggleCartItemSelectionRequest(bool IsSelected);
public record ToggleAllCartItemsSelectionRequest(bool IsSelected);
public record UpdateQuantityRequest(int Quantity);