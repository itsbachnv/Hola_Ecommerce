using System.Security.Claims;
using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Notifications.Commands;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Products.Commands;

public record DeleteProductCommand(long Id) : IRequest<bool>;

public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IProductRepository _productRepository;
    private IHttpContextAccessor _httpContextAccessor;
    private readonly ISender _mediator;

    public DeleteProductHandler(IProductRepository productRepository, IHttpContextAccessor httpContextAccessor, ISender mediator)
    {
        _productRepository = productRepository;
        _httpContextAccessor = httpContextAccessor;
        _mediator = mediator;
    }

    public async Task<bool> Handle(DeleteProductCommand c, CancellationToken ct)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
            throw new UnauthorizedAccessException("Phiên làm việc đã hết hạn");
        var currentUserId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var product = await _productRepository.FindAsync(c.Id, ct);
        if (product != null) 
        {
            _productRepository.Remove(product);
            await _productRepository.SaveChangesAsync(ct);
            try
            {
                var message =
                    $"Đã xoá sản phẩm {product.Slug} thành công.";

                await _mediator.Send(new SendNotificationCommand(
                    currentUserId,
                    "Tạo mới sản phẩm",
                    message,
                    "Xem chi tiết",
                    0, $"/dashboard/products"
                ), ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return true;
        }
       
        return false;
    }
}