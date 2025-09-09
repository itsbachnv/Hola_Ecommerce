using MediatR;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions.Variants;
using Ecommer.Application.Abstractions;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Ecommer.Application.Variants.Queries;

public record ListVariants(IPagedQuery Query, bool IsAdmin = false) : IRequest<IPagedResult<VariantDto>>;

public class ListVariantsHandler : IRequestHandler<ListVariants, IPagedResult<VariantDto>>
{
    private readonly IVariantRepository _variantRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ListVariantsHandler(IVariantRepository variantRepository, IHttpContextAccessor httpContextAccessor)
    {
        _variantRepository = variantRepository;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IPagedResult<VariantDto>> Handle(ListVariants request, CancellationToken cancellationToken)
    {
        // Check role từ JWT token hoặc từ request parameter
        var isAdmin = request.IsAdmin || IsUserAdmin();
        
        var pagedResult = await _variantRepository.GetPagedAsync(request.Query, isAdmin, cancellationToken);
        
        var variantDtos = pagedResult.Items.Select(v => v.ToDto(isAdmin)).ToList();
        
        return new PagedResult<VariantDto>(variantDtos, pagedResult.TotalCount, pagedResult.Page, pagedResult.PageSize);
    }

    private bool IsUserAdmin()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null) return false;

        // Check role từ claims
        return user.IsInRole("Admin") || 
               user.HasClaim(ClaimTypes.Role, "Admin") ||
               user.HasClaim("role", "Admin");
    }
}

public class PagedResult<T> : IPagedResult<T>
{
    public IEnumerable<T> Items { get; }
    public int TotalCount { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

    public PagedResult(IEnumerable<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }
}
