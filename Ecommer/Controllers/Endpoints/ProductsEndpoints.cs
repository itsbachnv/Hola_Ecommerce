using Ecommer.Application.Abstractions;
using Ecommer.Application.Products.Commands;
using Ecommer.Application.Products.Dtos;
using Ecommer.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

public static class ProductsEndpoints
{
    public static IEndpointRouteBuilder MapProducts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/products")
            .WithTags("Products");

        group.MapGet("", async Task<Ok<PagedResult<ProductDto>>> (
            string? search, long? brandId, long? categoryId, string? status, string? sort,
            ISender sender, int page = 1, int pageSize = 20) =>
        {
            var result =
                await sender.Send(new ListProductsQuery(search, brandId, categoryId, status, sort, page, pageSize));
            return TypedResults.Ok(result);
        });

        // Get by id
        group.MapGet("{id:long}", async Task<Results<Ok<ProductDto>, NotFound>> (long id, ISender sender) =>
        {
            var data = await sender.Send(new GetProductByIdQuery(id));
            return data is null ? TypedResults.NotFound() : TypedResults.Ok(data);
        });

        // Create (chỉ cho role Admin)
        group.MapPost("", async Task<Results<Created<ProductDto>, ValidationProblem>> (
            CreateProductCommand cmd, ISender sender) =>
        {
            var created = await sender.Send(cmd);
            return TypedResults.Created($"/products/{created.Id}", created);
        })
        .RequireAuthorization("AdminPolicy"); // policy custom

        // Update (role Admin hoặc Manager)
        group.MapPut("{id:long}", async Task<Results<Ok<ProductDto>, NotFound, ValidationProblem>> (
            long id, UpdateProductCommand body, ISender sender) =>
        {
            var cmd = body with { Id = id };
            var updated = await sender.Send(cmd);
            return updated is null ? TypedResults.NotFound() : TypedResults.Ok(updated);
        })
        .RequireAuthorization("AdminPolicy");

        // Delete (chỉ Admin)
        group.MapDelete("{id:long}", async Task<Results<NoContent, NotFound>> (long id, ISender sender) =>
        {
            var ok = await sender.Send(new DeleteProductCommand(id));
            return ok ? TypedResults.NoContent() : TypedResults.NotFound();
        })
        .RequireAuthorization("AdminPolicy");

        return app;
    }
}
