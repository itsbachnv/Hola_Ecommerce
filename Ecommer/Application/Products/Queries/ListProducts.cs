using Ecommer.Application.Abstractions;
using Ecommer.Application.Products.Dtos;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Products.Queries;

// query
public record ListProductsQuery(
    string? Search,
    long? BrandId,
    long? CategoryId,
    string? Status,
    string? Sort,
    int Page = 1,
    int PageSize = 20
) : IRequest<PagedResult<ProductDto>>, IPagedQuery;

// handler
public class ListProductsHandler : IRequestHandler<ListProductsQuery, PagedResult<ProductDto>>
{
    private readonly IProductRepository  _productRepository;
    public ListProductsHandler(IProductRepository productRepository) => _productRepository = productRepository;

    public Task<PagedResult<ProductDto>> Handle(ListProductsQuery q, CancellationToken ct) =>
        _productRepository.ListAsync(q.Search, q.BrandId, q.CategoryId, q.Status, q.Sort, q.Page, q.PageSize, ct);
}