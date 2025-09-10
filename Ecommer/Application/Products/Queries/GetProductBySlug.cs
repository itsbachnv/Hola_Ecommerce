using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Products.Dtos;
using MediatR;

namespace Ecommer.Application.Products.Queries;

public record GetProductBySlugQuery(string Slug, bool IsAdmin = false) : IRequest<ProductDto?>;
public class GetProductBySlugHandler : IRequestHandler<GetProductBySlugQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;

    public GetProductBySlugHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductDto?> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        return await _productRepository.GetBySlugAsync(request.Slug, request.IsAdmin, cancellationToken);
    }
}