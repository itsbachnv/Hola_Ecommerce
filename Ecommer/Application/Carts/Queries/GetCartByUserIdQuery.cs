using Ecommer.Application.Abstractions.Carts;
using Ecommer.Application.Carts.Dtos;
using MediatR;

namespace Ecommer.Application.Carts.Queries;

public record GetCartByUserIdQuery(long UserId) : IRequest<GetCartByUserIdResult>;

public class GetCartByUserIdResult
{
    public bool IsSuccess { get; set; }
    public CartDto? Value { get; set; }
    public string? ErrorMessage { get; set; }

    public static GetCartByUserIdResult Success(CartDto cart) => new() { IsSuccess = true, Value = cart };
    public static GetCartByUserIdResult Failure(string error) => new() { IsSuccess = false, ErrorMessage = error };
}

public class GetCartByUserIdHandler : IRequestHandler<GetCartByUserIdQuery, GetCartByUserIdResult>
{
    private readonly ICartRepository _cartRepository;

    public GetCartByUserIdHandler(ICartRepository cartRepository)
    {
        _cartRepository = cartRepository;
    }

    public async Task<GetCartByUserIdResult> Handle(GetCartByUserIdQuery request, CancellationToken cancellationToken)
    {
        var cart = await _cartRepository.GetCartByUserIdAsync(request.UserId, cancellationToken);
        
        if (cart == null)
            return GetCartByUserIdResult.Failure("Cart not found");

        return GetCartByUserIdResult.Success(cart.ToDto());
    }
}