using Ecommer.Application.Abstractions.Carts;
using MediatR;

namespace Ecommer.Application.Carts.Commands;

public record RemoveFromCartByProductCommand(long ProductId, long VariantId, long? UserId = null) : IRequest<bool>;

public class RemoveFromCartByProductHandler : IRequestHandler<RemoveFromCartByProductCommand, bool>
{
    private readonly ICartRepository _cartRepository;

    public RemoveFromCartByProductHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<bool> Handle(RemoveFromCartByProductCommand request, CancellationToken cancellationToken)
    {
        if (!request.UserId.HasValue) return false;

        var cart = await _cartRepository.GetActiveCartByUserIdAsync(request.UserId.Value, cancellationToken);
        if (cart == null) return false;

        var cartItem = await _cartRepository.GetCartItemAsync(cart.Id, request.ProductId, request.VariantId, cancellationToken);
        if (cartItem == null) return false;

        _cartRepository.RemoveItem(cartItem);
        await _cartRepository.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
