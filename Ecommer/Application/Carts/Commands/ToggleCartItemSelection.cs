using Ecommer.Application.Abstractions.Carts;
using Ecommer.Application.Carts.Dtos;
using MediatR;

namespace Ecommer.Application.Carts.Commands;

public record ToggleCartItemSelectionCommand(
    long CartItemId,
    bool IsSelected
) : IRequest<CartItemDto>;

public class ToggleCartItemSelectionHandler : IRequestHandler<ToggleCartItemSelectionCommand, CartItemDto>
{
    private readonly ICartRepository _cartRepository;

    public ToggleCartItemSelectionHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartItemDto> Handle(ToggleCartItemSelectionCommand request, CancellationToken cancellationToken)
    {
        var cartItem = await _cartRepository.GetCartItemByIdAsync(request.CartItemId, cancellationToken);
        if (cartItem == null)
            throw new Exception("Cart item not found");

        cartItem.IsSelectedForCheckout = request.IsSelected;
        
        _cartRepository.UpdateCartItem(cartItem);
        await _cartRepository.SaveChangesAsync(cancellationToken);

        return cartItem.ToDto();
    }
}
