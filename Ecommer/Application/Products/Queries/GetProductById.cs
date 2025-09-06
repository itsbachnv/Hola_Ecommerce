using Ecommer.Application.Abstractions;
using Ecommer.Application.Products.Dtos;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Products.Queries;

public record GetProductByIdQuery(long Id) : IRequest<ProductDto?>;

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;
    public GetProductByIdHandler(IProductRepository productRepository) => _productRepository = productRepository;

    public async Task<ProductDto?> Handle(GetProductByIdQuery q, CancellationToken ct)
    {
        var p = await _productRepository.FindAsync(q.Id, ct);
        return ProductMapping.ToDto(p);
    }
}