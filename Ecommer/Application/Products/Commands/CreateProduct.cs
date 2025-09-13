using System.Security.Claims;
using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Notifications.Commands;
using Ecommer.Application.Products.Dtos;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Products.Commands;

public record CreateProductCommand(
    string Name,
    string Slug,
    long? BrandId,
    long? CategoryId,
    string? Description,
    string Status = "ACTIVE"
) : IRequest<ProductDto>;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _repo;
    private readonly IUserRepository _users;
    private readonly ISender _mediator;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateProductHandler(IProductRepository repo, IUserRepository users, ISender mediator, IHttpContextAccessor httpContextAccessor)
    {
        _repo = repo;
        _users = users;
        _mediator = mediator;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<ProductDto> Handle(CreateProductCommand c, CancellationToken ct)
    {
        // Rule nhẹ: slug unique
        
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
            throw new UnauthorizedAccessException("Phiên làm việc đã hết hạn");
        var currentUserId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        
        if (await _repo.SlugExistsAsync(c.Slug, null, ct))
            throw new InvalidOperationException("Slug đã tồn tại");

        if (_repo.GetByNameAsync(c.Slug, true, ct)) //true is exist
        {
            throw new Exception("Tên sản phẩm đã tồn tại");
        }
        var entity = new Product
        {
            Name = c.Name.Trim(),
            Slug = c.Slug.Trim(),
            BrandId = c.BrandId,
            CategoryId = c.CategoryId,
            Description = c.Description,
            Status = string.IsNullOrWhiteSpace(c.Status) ? "ACTIVE" : c.Status
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        
        try
        {
            var message =
                $"Đã tạo mới sản phẩm {entity.Slug} thành công.";

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

        return entity.ToDto();
    }
}