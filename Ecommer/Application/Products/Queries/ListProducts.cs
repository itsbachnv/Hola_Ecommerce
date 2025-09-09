using MediatR;
using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Products.Dtos;

namespace Ecommer.Application.Products.Queries;

// query
public record ListProductsQuery(
    string? Search,
    long? BrandId,
    long? CategoryId,
    string? Status,
    string? Sort,
    int Page = 1,
    int PageSize = 20,
    bool IsAdmin = false // Thêm tham số này
) : IRequest<PagedResult<ProductDto>>, IPagedQuery;

// handler
public class ListProductsHandler : IRequestHandler<ListProductsQuery, PagedResult<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    
    public ListProductsHandler(IProductRepository productRepository) => 
        _productRepository = productRepository;

    public Task<PagedResult<ProductDto>> Handle(ListProductsQuery request, CancellationToken cancellationToken) =>
        _productRepository.ListAsync(
            request.Search, 
            request.BrandId, 
            request.CategoryId, 
            request.Status, 
            request.Sort, 
            request.Page, 
            request.PageSize, 
            request.IsAdmin, 
            cancellationToken);
}