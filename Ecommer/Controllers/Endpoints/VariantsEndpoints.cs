using MediatR;
using Microsoft.AspNetCore.Mvc;
using Ecommer.Application.Variants.Commands;
using Ecommer.Application.Variants.Queries;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions;
using System.Security.Claims;

namespace Ecommer.Controllers.Endpoints;

public static class VariantsEndpoints
{
    public static void MapVariantsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/variants").WithTags("Variants");

        group.MapGet("/", GetVariants);
        group.MapGet("/{id:long}", GetVariantById);
        group.MapGet("/sku/{sku}", GetVariantBySku);
        group.MapGet("/product/{productId:long}", GetVariantsByProductId);
        group.MapPost("/", CreateVariant);
        group.MapPut("/{id:long}", UpdateVariant);
        group.MapDelete("/{id:long}", DeleteVariant);
    }

    private static async Task<IResult> GetVariants(
        [FromServices] IMediator mediator,
        HttpContext context,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        // Check xem user có role Admin không
        var isAdmin = context.User.IsInRole("Admin") || 
                     context.User.HasClaim(ClaimTypes.Role, "Admin") ||
                     context.User.HasClaim("role", "Admin");

        var query = new PagedQuery(page, pageSize);
        var result = await mediator.Send(new ListVariants(query, isAdmin));
        return Results.Ok(result);
    }

    private static async Task<IResult> GetVariantById(
        [FromServices] IMediator mediator,
        long id)
    {
        var result = await mediator.Send(new GetVariantById(id));
        return result != null ? Results.Ok(result) : Results.NotFound();
    }

    private static async Task<IResult> GetVariantBySku(
        [FromServices] IMediator mediator,
        string sku)
    {
        var result = await mediator.Send(new GetVariantBySku(sku));
        return result != null ? Results.Ok(result) : Results.NotFound();
    }

    private static async Task<IResult> GetVariantsByProductId(
        [FromServices] IMediator mediator,
        long productId)
    {
        var result = await mediator.Send(new GetVariantsByProductId(productId));
        return Results.Ok(result);
    }

    private static async Task<IResult> CreateVariant(
        [FromServices] IMediator mediator,
        [FromBody] CreateVariantDto variant)
    {
        var command = new CreateVariant(variant);
        var result = await mediator.Send(command);
        return Results.Created($"/api/variants/{result.Id}", result);
    }

    private static async Task<IResult> UpdateVariant(
        [FromServices] IMediator mediator,
        long id,
        [FromBody] UpdateVariantDto variant)
    {
        variant.Id = id;
        var command = new UpdateVariant(variant);
        var result = await mediator.Send(command);
        return Results.Ok(result);
    }

    private static async Task<IResult> DeleteVariant(
        [FromServices] IMediator mediator,
        long id)
    {
        var command = new DeleteVariant(id);
        var result = await mediator.Send(command);
        return result ? Results.NoContent() : Results.NotFound();
    }
}

public record PagedQuery(int Page, int PageSize) : IPagedQuery;
