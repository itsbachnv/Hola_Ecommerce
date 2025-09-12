using Ecommer.Application.Abstractions.Carts;
using Ecommer.Application.Carts.Dtos;
using MediatR;

namespace Ecommer.Application.Carts.Commands;

public record ToggleAllCartItemsSelectionCommand(
    long CartId,
    bool IsSelected
) : IRequest<CartDto>;

public class ToggleAllCartItemsSelectionHandler : IRequestHandler<ToggleAllCartItemsSelectionCommand, CartDto>
{
    private readonly ICartRepository _cartRepository;

    public ToggleAllCartItemsSelectionHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartDto> Handle(ToggleAllCartItemsSelectionCommand request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetCartWithItemsAsync(request.CartId, cancellationToken);
        if (cart == null)
            throw new Exception("Cart not found");

        foreach (var item in cart.Items)
        {
            item.IsSelectedForCheckout = request.IsSelected;
        }
        
        _cartRepository.Update(cart);
        await _cartRepository.SaveChangesAsync(cancellationToken);

        return cart.ToDto();
    }
}
