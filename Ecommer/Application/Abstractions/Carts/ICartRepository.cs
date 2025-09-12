using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Carts;

public interface ICartRepository
{
    Task<Cart?> GetActiveCartByUserIdAsync(long? userId, CancellationToken cancellationToken = default);
    Task<Cart?> GetCartByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<Cart?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Cart?> GetCartWithItemsAsync(long cartId, CancellationToken cancellationToken = default);
    Task<CartItem?> GetCartItemAsync(long cartId, long productId, long? variantId, CancellationToken cancellationToken = default);
    Task<CartItem?> GetCartItemByIdAsync(long cartItemId, CancellationToken cancellationToken = default);
    Task AddAsync(Cart cart, CancellationToken cancellationToken = default);
    void Update(Cart cart);
    void UpdateCartItem(CartItem item);
    void RemoveItem(CartItem item);
    void Delete(Cart cart);
    Task<bool> ExistsAsync(long cartId, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}