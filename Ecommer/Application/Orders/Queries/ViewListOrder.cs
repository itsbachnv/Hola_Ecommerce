using System.Security.Claims;
using Ecommer.Application.Orders.Dtos;
using Ecommer.Domain;
using Ecommer.Enums;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Orders.Queries;

public record ViewListOrderQuery : IRequest<List<ViewOrderDto>>
{
    
}

public class ViewListOrderQueryHandler : IRequestHandler<ViewListOrderQuery, List<ViewOrderDto>>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppDbContext _dbContext;

        public ViewListOrderQueryHandler(
            IHttpContextAccessor httpContextAccessor,
            AppDbContext dbContext)
        {
            _httpContextAccessor = httpContextAccessor;
            _dbContext = dbContext;
        }

        public async Task<List<ViewOrderDto>> Handle(ViewListOrderQuery request, CancellationToken cancellationToken)
        {
            var user = _httpContextAccessor.HttpContext?.User;
            var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                throw new UnauthorizedAccessException("Phiên làm việc đã hết hạn");

            var userId = long.Parse(userIdClaim.Value);
            var roleClaim = user.FindFirst(ClaimTypes.Role);
            var isAdmin = roleClaim != null && roleClaim.Value == "Admin";

            IQueryable<Order> query = _dbContext.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .ThenInclude(p => p.Images)
                .Include(o => o.Items)
                .ThenInclude(i => i.Variant)
                .Include(o => o.Payments);

            if (!isAdmin)
            {
                query = query.Where(o => o.UserId == userId);
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync(cancellationToken);

            var result = orders.Select(order => new ViewOrderDto
            {
                Id = order.Id,
                OrderNumber = order.Code,
                Status = order.Status.ToString(),
                Total = order.GrandTotal,
                Refund = order.Status == OrderStatus.Refunded ? order.GrandTotal : 0,
                CreatedAt = order.CreatedAt,
                Note = order.Notes,
                Action = order.Status == OrderStatus.Refunded ? "ĐÃ HOÀN TIỀN" : null,

                Items = order.Items.Select(i => new ViewOrderItemDto
                {
                    ProductId = i.ProductId,
                    VariantId = i.VariantId ?? 0,
                    ProductName = i.Product?.Name ?? string.Empty,
                    VariantName = i.Variant?.Name,
                    ImageUrl = i.Product?.Images
                        .OrderByDescending(img => img.IsPrimary) 
                        .ThenBy(img => img.SortOrder)
                        .FirstOrDefault()?.Url,
                    Quantity = i.Quantity,
                    Price = i.Variant?.Price ?? i.UnitPrice
                }).ToList()
            }).ToList();
            return result;
        }
    }