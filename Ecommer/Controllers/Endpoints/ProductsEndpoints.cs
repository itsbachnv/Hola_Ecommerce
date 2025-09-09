using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Products.Commands;
using Ecommer.Application.Products.Dtos;
using Ecommer.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Security.Claims;

public static class ProductsEndpoints
{
    public static IEndpointRouteBuilder MapProducts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/products")
            .WithTags("Products");

        group.MapGet("", async Task<Ok<PagedResult<ProductDto>>> (
            string? search, long? brandId, long? categoryId, string? status, string? sort,
            HttpContext context, ISender sender, int page = 1, int pageSize = 20) =>
        {
            // Check xem user có role Admin không
            var isAdmin = context.User.IsInRole("Admin") || 
                         context.User.HasClaim(ClaimTypes.Role, "Admin") ||
                         context.User.HasClaim("role", "Admin");

            var result = await sender.Send(new ListProductsQuery(search, brandId, categoryId, status, sort, page, pageSize, isAdmin));
            return TypedResults.Ok(result);
        });

        // Get by id
        group.MapGet("{id:long}", async Task<Results<Ok<ProductDto>, NotFound>> (long id, HttpContext context, ISender sender) =>
        {
            // Check role cho GetById
            var isAdmin = context.User.IsInRole("Admin") || 
                         context.User.HasClaim(ClaimTypes.Role, "Admin") ||
                         context.User.HasClaim("role", "Admin");

            var data = await sender.Send(new GetProductByIdQuery(id, isAdmin));
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

        group.MapPost("{id:long}/images", async Task<Results<Ok<string>, NotFound, BadRequest>> (
                HttpContext ctx, long id, IProductRepository repo, CancellationToken ct) =>
            {
                var form = await ctx.Request.ReadFormAsync(ct);
                var file = form.Files.FirstOrDefault();
                if (file is null) return TypedResults.BadRequest();

                var product = await repo.FindAsync(id, ct);
                if (product is null) return TypedResults.NotFound();

                var url = await repo.UploadImageAsync(id, file, ct);
                return TypedResults.Ok(url);
            })
            .RequireAuthorization("AdminPolicy");
        
        return app;
    }
}
