using Ecommer.Application.Abstractions.Carts;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Carts.Commands;

public record UpdateCartQuantityByProductCommand(long ProductId, long VariantId, int Quantity, long? UserId = null) : IRequest<bool>;

public class UpdateCartQuantityByProductHandler : IRequestHandler<UpdateCartQuantityByProductCommand, bool>
{
    private readonly ICartRepository _cartRepository;

    public UpdateCartQuantityByProductHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<bool> Handle(UpdateCartQuantityByProductCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0 || !request.UserId.HasValue) 
            return false;

        var cart = await _cartRepository.GetActiveCartByUserIdAsync(request.UserId.Value, cancellationToken);
        if (cart == null) return false;

        var cartItem = await _cartRepository.GetCartItemAsync(cart.Id, request.ProductId, request.VariantId, cancellationToken);
        if (cartItem == null) return false;

        cartItem.Quantity = request.Quantity;
        cartItem.TotalPrice = cartItem.UnitPrice * request.Quantity;

        await _cartRepository.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
