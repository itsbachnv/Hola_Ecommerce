using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Products.Commands;

public record DeleteProductCommand(long Id) : IRequest<bool>;

public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IProductRepository _productRepository;
    public DeleteProductHandler(IProductRepository productRepository) => _productRepository = productRepository;

    public async Task<bool> Handle(DeleteProductCommand c, CancellationToken ct)
    {
        var product = await _productRepository.FindAsync(c.Id, ct);
        if (product != null) 
        {
            _productRepository.Remove(product);
            await _productRepository.SaveChangesAsync(ct);
            return true;
        }
        return false;
    }
}