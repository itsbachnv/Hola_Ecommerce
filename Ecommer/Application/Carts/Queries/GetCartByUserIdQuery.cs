using Ecommer.Application.Abstractions.Carts;
using Ecommer.Application.Carts.Dtos;
using MediatR;

namespace Ecommer.Application.Carts.Queries;

public record GetCartByUserIdQuery(long UserId) : IRequest<CartDto>;

public class GetCartByUserIdHandler : IRequestHandler<GetCartByUserIdQuery,CartDto>
{
    private readonly ICartRepository _cartRepository;

    public GetCartByUserIdHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<CartDto> Handle(GetCartByUserIdQuery request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetActiveCartByUserIdAsync(request.UserId, cancellationToken);
        
        if (cart == null)
            throw new Exception("Cart not found");

        return cart.ToDto();
    }
}