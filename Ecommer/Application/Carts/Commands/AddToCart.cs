using Ecommer.Application.Abstractions.Carts;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Carts.Dtos;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Carts;

public record AddToCartCommand(
    long ProductId,
    long? VariantId,
    int Quantity,
    long? UserId
) : IRequest<CartDto>;

public class AddToCartHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    public AddToCartHandler(
        ICartRepository cartRepository,
        IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public async Task<CartDto> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        // Validate product exists
        var product = await _productRepository.GetByIdAsync(request.ProductId, false, cancellationToken);
        if (product == null)
            throw new Exception("Product not found");
    
        // Get or create cart
        var cart = await _cartRepository.GetActiveCartByUserIdAsync(request.UserId, cancellationToken);
        bool isNewCart = cart == null;
    
        if (isNewCart)
        {
            cart = new Cart
            {
                UserId = request.UserId,
                Status = "Active",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                Items = new List<CartItem>()
            };
            await _cartRepository.AddAsync(cart, cancellationToken);
            // Save để cart có Id thật
            await _cartRepository.SaveChangesAsync(cancellationToken);
        }
    
        // Check if item already exists in cart
        var existingItem = await _cartRepository.GetCartItemAsync(
            cart.Id, request.ProductId, request.VariantId, cancellationToken);
    
        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            // Tính lại price nếu có
            var unitPrice = request.VariantId.HasValue 
                ? product.Variants?.FirstOrDefault(v => v.Id == request.VariantId)?.Price ?? 0
                : 0;
            existingItem.UnitPrice = unitPrice;
            existingItem.TotalPrice = existingItem.Quantity * unitPrice;
        }
        else
        {
            // Lấy giá từ variant
            var unitPrice = request.VariantId.HasValue 
                ? product.Variants?.FirstOrDefault(v => v.Id == request.VariantId)?.Price ?? 0
                : 0;
    
            var newItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                VariantId = request.VariantId,
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = request.Quantity * unitPrice,
                CreatedAt = DateTimeOffset.UtcNow
            };
            cart.Items.Add(newItem);
        }
    
        cart.UpdatedAt = DateTimeOffset.UtcNow;
    
        // Chỉ Update nếu cart đã tồn tại
        if (!isNewCart)
        {
            _cartRepository.Update(cart);
        }
    
        // Save changes
        await _cartRepository.SaveChangesAsync(cancellationToken);
    
        // Return result
        return cart.ToDto();
    }
}