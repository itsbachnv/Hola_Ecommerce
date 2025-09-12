using Ecommer.Application.Abstractions.Carts;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Carts.Commands;

public record UpdateCartQuantityCommand(long CartItemId, int Quantity, long? UserId = null) : IRequest<CartItem?>;

public class UpdateCartQuantityHandler : IRequestHandler<UpdateCartQuantityCommand, CartItem?>
{
    private readonly ICartRepository _cartRepository;

    public UpdateCartQuantityHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartItem?> Handle(UpdateCartQuantityCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
            return null;

        var cartItem = await _cartRepository.GetCartItemByIdAsync(request.CartItemId, cancellationToken);
        if (cartItem == null)
            return null;

        // Verify ownership if userId is provided
        if (request.UserId.HasValue)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(request.UserId.Value, cancellationToken);
            if (cart == null || cartItem.CartId != cart.Id)
                return null;
        }

        cartItem.Quantity = request.Quantity;
        cartItem.TotalPrice = cartItem.UnitPrice * request.Quantity;

        await _cartRepository.SaveChangesAsync(cancellationToken);
        
        return cartItem;
    }
}
