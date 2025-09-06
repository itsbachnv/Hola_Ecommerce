using Ecommer.Application.Abstractions;
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
    string Status = "Active"
) : IRequest<ProductDto>;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _repo;
    private readonly IUserRepository _users;
    private readonly ISender _mediator;

    public CreateProductHandler(IProductRepository repo, IUserRepository users, ISender mediator)
    {
        _repo = repo;
        _users = users;
        _mediator = mediator;
    }

    public async Task<ProductDto> Handle(CreateProductCommand c, CancellationToken ct)
    {
        // Rule nhẹ: slug unique
        if (await _repo.SlugExistsAsync(c.Slug, null, ct))
            throw new InvalidOperationException("Slug already exists");

        var entity = new Product
        {
            Name = c.Name.Trim(),
            Slug = c.Slug.Trim(),
            BrandId = c.BrandId,
            CategoryId = c.CategoryId,
            Description = c.Description,
            Status = string.IsNullOrWhiteSpace(c.Status) ? "Active" : c.Status
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        
        try
        {
            var adminIds = await _users.GetAdminUserIdsAsync(ct);

            if (adminIds.Count > 0)
            {
                var title = "Sản phẩm mới đã được tạo";
                var message = $"[{entity.Name}] đã được thêm vào catalog.";
                var mappingUrl = $"/admin/products/{entity.Id}";

                await _mediator.Send(new SendNotificationCommand(
                    Title: title,
                    Message: message,
                    Type: "ProductCreated",
                    MappingUrl: mappingUrl,
                    RelatedObjectType: "Product",
                    RelatedObjectId: entity.Id,
                    RecipientUserIds: adminIds
                ), ct);
            }
        }
        catch
        {
        }

        return entity.ToDto();
    }
}