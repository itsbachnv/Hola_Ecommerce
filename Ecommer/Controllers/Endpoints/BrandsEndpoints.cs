using Ecommer.Application.Brands.Queries;
using MediatR;

namespace Ecommer.Controllers.Endpoints;

public static class BrandsEndpoints
{
    public static IEndpointRouteBuilder MapBrands(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/brands").WithTags("Brands");
        
        // GET: /brands
        group.MapGet("/", async (ISender sender, CancellationToken ct) =>
        {
            var brands = await sender.Send(new ListBrandsQuery(), ct);
            return Results.Ok(brands);
        });

        return app;
    }
    
}