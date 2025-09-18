using System.Security.Claims;
using Ecommer.Application.Orders.Dtos;
using Ecommer.Domain;
using Ecommer.Enums;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Orders.Queries;

public record ViewByOrderCodeQuery(string OrderCode) : IRequest<ViewOrderDetailDto>;

public class ViewByOrderCodeQueryHandler : IRequestHandler<ViewByOrderCodeQuery, ViewOrderDetailDto>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AppDbContext _dbContext;

    public ViewByOrderCodeQueryHandler(IHttpContextAccessor httpContextAccessor, AppDbContext dbContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _dbContext = dbContext;
    }

   public async Task<ViewOrderDetailDto> Handle(ViewByOrderCodeQuery request, CancellationToken cancellationToken)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            throw new UnauthorizedAccessException("Phiên làm việc đã hết hạn");

        var userId = long.Parse(userIdClaim.Value);
        var isAdmin = user.IsInRole("Admin");

        var order = await _dbContext.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(o => o.Items).ThenInclude(i => i.Variant)
            .Include(o => o.Payments)
            .Include(o => o.Shipments)
            .FirstOrDefaultAsync(o => o.Code == request.OrderCode &&
                                      (o.UserId == userId || isAdmin),
                cancellationToken);

        if (order == null)
            throw new KeyNotFoundException("Không tìm thấy đơn hàng");

        return new ViewOrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.Code,
            Status = order.Status.ToString(),
            Total = order.GrandTotal,
            ShippingFee = order.ShippingFee,
            DiscountTotal = order.DiscountTotal,
            CreatedAt = order.CreatedAt,
            ShippingAddress = new ShippingAddressDto
            {
                Address = order.ShippingAddress?.RootElement.ToString() ?? ""
            },
            Items = order.Items.Select(i => new OrderItemsDto
            {
                Id = i.Id,
                Name = i.Product?.Name ?? string.Empty,
                Price = i.UnitPrice,
                Quantity = i.Quantity,
                Image = i.Product?.Images
                    .OrderByDescending(img => img.IsPrimary)
                    .ThenBy(img => img.SortOrder)
                    .FirstOrDefault()?.Url,
                
                VariantId = i.VariantId,
                VariantName = i.Variant?.Name ?? string.Empty,
                VariantSku = i.Variant?.Sku ?? string.Empty,
                VariantAttributes = i.Variant?.Attributes?.RootElement.ToString()
            }).ToList(),
            PaymentMethod = order.Payments.FirstOrDefault()?.Provider ?? "Chưa xác định",
            Logs = order.Shipments.Select(s => new OrderLogDto
            {
                Time = s.CreatedAt.ToString("HH:mm dd-MM-yyyy"),
                Status = s.Status.ToString(),
                Note = $"Tracking: {s.TrackingNumber ?? "N/A"}"
            }).ToList()
        };
    }
}
