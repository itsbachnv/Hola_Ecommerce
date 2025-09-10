using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Products.Commands;
using Ecommer.Application.Products.Dtos;
using Ecommer.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

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
        
        // Upload image for product (chỉ Admin)
        group.MapPost("{id:long}/images", async Task<Results<Ok<string>, NotFound, BadRequest>> (
                    HttpContext ctx, long id, IProductRepository repo, CancellationToken ct) =>
                {
                    // Kiểm tra Content-Type trước
                    if (!ctx.Request.HasFormContentType)
                        return TypedResults.BadRequest();
            
                    var form = await ctx.Request.ReadFormAsync(ct);
                    var file = form.Files.FirstOrDefault();
                    
                    if (file is null || file.Length == 0)
                        return TypedResults.BadRequest();
            
                    var product = await repo.FindAsync(id, ct);
                    if (product is null) return TypedResults.NotFound();

                    // Parse isPrimary from form data
                    var isPrimary = false;
                    if (form.ContainsKey("isPrimary") && bool.TryParse(form["isPrimary"], out var parsedIsPrimary))
                    {
                        isPrimary = parsedIsPrimary;
                    }
            
                    var url = await repo.UploadImageAsync(id, file, isPrimary, ct);
                    return TypedResults.Ok(url);
                })
                .RequireAuthorization("AdminPolicy")
                .DisableAntiforgery()
                .WithOpenApi(operation =>
                {
                    operation.RequestBody = new Microsoft.OpenApi.Models.OpenApiRequestBody
                    {
                        Content = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiMediaType>
                        {
                            ["multipart/form-data"] = new Microsoft.OpenApi.Models.OpenApiMediaType
                            {
                                Schema = new Microsoft.OpenApi.Models.OpenApiSchema
                                {
                                    Type = "object",
                                    Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
                                    {
                                        ["file"] = new Microsoft.OpenApi.Models.OpenApiSchema
                                        {
                                            Type = "string",
                                            Format = "binary"
                                        },
                                        ["isPrimary"] = new Microsoft.OpenApi.Models.OpenApiSchema
                                        {
                                            Type = "boolean"
                                        }
                                    }
                                }
                            }
                        }
                    };
                    return operation;
                });

        // Batch upload images for product (chỉ Admin)
        group.MapPost("{id:long}/images/batch", async Task<Results<Ok<object>, NotFound, BadRequest>> (
                    HttpContext ctx, long id, IProductRepository repo, CancellationToken ct) =>
                {
                    // Kiểm tra Content-Type trước
                    if (!ctx.Request.HasFormContentType)
                        return TypedResults.BadRequest();
            
                    var form = await ctx.Request.ReadFormAsync(ct);
                    var files = form.Files;
                    
                    if (files == null || files.Count == 0)
                        return TypedResults.BadRequest();
            
                    var product = await repo.FindAsync(id, ct);
                    if (product is null) return TypedResults.NotFound();

                    // Parse sortOrders and isPrimary arrays from form data
                    var sortOrders = new List<int>();
                    var isPrimaryFlags = new List<bool>();

                    // Lấy sortOrders từ form data
                    if (form.ContainsKey("sortOrders"))
                    {
                        foreach (var value in form["sortOrders"])
                        {
                            if (int.TryParse(value, out var sortOrder))
                                sortOrders.Add(sortOrder);
                        }
                    }

                    // Lấy isPrimary flags từ form data
                    if (form.ContainsKey("isPrimary"))
                    {
                        foreach (var value in form["isPrimary"])
                        {
                            if (bool.TryParse(value, out var isPrimary))
                                isPrimaryFlags.Add(isPrimary);
                        }
                    }
            
                    var urls = await repo.UploadImagesAsync(id, files, sortOrders, isPrimaryFlags, ct);
                    return TypedResults.Ok<object>(new { urls = urls, count = urls.Count });
                })
                .RequireAuthorization("AdminPolicy")
                .DisableAntiforgery()
                .WithOpenApi(operation =>
                {
                    operation.RequestBody = new Microsoft.OpenApi.Models.OpenApiRequestBody
                    {
                        Content = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiMediaType>
                        {
                            ["multipart/form-data"] = new Microsoft.OpenApi.Models.OpenApiMediaType
                            {
                                Schema = new Microsoft.OpenApi.Models.OpenApiSchema
                                {
                                    Type = "object",
                                    Properties = new Dictionary<string, Microsoft.OpenApi.Models.OpenApiSchema>
                                    {
                                        ["files"] = new Microsoft.OpenApi.Models.OpenApiSchema
                                        {
                                            Type = "array",
                                            Items = new Microsoft.OpenApi.Models.OpenApiSchema
                                            {
                                                Type = "string",
                                                Format = "binary"
                                            }
                                        },
                                        ["sortOrders"] = new Microsoft.OpenApi.Models.OpenApiSchema
                                        {
                                            Type = "array",
                                            Items = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "integer" }
                                        },
                                        ["isPrimary"] = new Microsoft.OpenApi.Models.OpenApiSchema
                                        {
                                            Type = "array",
                                            Items = new Microsoft.OpenApi.Models.OpenApiSchema { Type = "boolean" }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    return operation;
                });

        // Delete product image
        group.MapDelete("{id:long}/images", async Task<Results<NoContent, NotFound, BadRequest>> (
            HttpContext ctx, long id, IProductRepository repo, CancellationToken ct) =>
        {
            var imageUrl = ctx.Request.Query["url"].ToString();
            if (string.IsNullOrEmpty(imageUrl))
                return TypedResults.BadRequest();

            var product = await repo.FindAsync(id, ct);
            if (product is null) return TypedResults.NotFound();

            var success = await repo.RemoveImageAsync(id, imageUrl, ct);
            return success ? TypedResults.NoContent() : TypedResults.NotFound();
        })
        .RequireAuthorization("AdminPolicy");

        // Update primary image
        group.MapPatch("{id:long}/images/primary", async Task<Results<NoContent, NotFound, BadRequest>> (
            HttpContext ctx, long id, IProductRepository repo, CancellationToken ct) =>
        {
            var imageUrl = ctx.Request.Query["url"].ToString();
            if (string.IsNullOrEmpty(imageUrl))
                return TypedResults.BadRequest();

            var product = await repo.FindAsync(id, ct);
            if (product is null) return TypedResults.NotFound();

            var success = await repo.SetPrimaryImageAsync(id, imageUrl, ct);
            return success ? TypedResults.NoContent() : TypedResults.NotFound();
        })
        .RequireAuthorization("AdminPolicy");
        
        return app;
    }
}
