using Ecommer.Application.Abstractions.Carts;
using MediatR;

namespace Ecommer.Application.Carts.Commands;

public record RemoveFromCartCommand(long CartItemId, long? UserId = null) : IRequest<bool>;

public class RemoveFromCartHandler : IRequestHandler<RemoveFromCartCommand, bool>
{
    private readonly ICartRepository _cartRepository;

    public RemoveFromCartHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<bool> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        var cartItem = await _cartRepository.GetCartItemByIdAsync(request.CartItemId, cancellationToken);
        if (cartItem == null)
            return false;

        // Verify ownership if userId is provided
        if (request.UserId.HasValue)
        {
            var cart = await _cartRepository.GetCartByUserIdAsync(request.UserId.Value, cancellationToken);
            if (cart == null || cartItem.CartId != cart.Id)
                return false;
        }

        _cartRepository.RemoveItem(cartItem);
        await _cartRepository.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
