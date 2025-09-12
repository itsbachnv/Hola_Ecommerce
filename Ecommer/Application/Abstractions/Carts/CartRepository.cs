using Ecommer.Application.Products.Commands;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Abstractions.Carts;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetActiveCartByUserIdAsync(long? userId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .Include(c => c.Items)
                .ThenInclude(i => i.Variant)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Active", cancellationToken);
    }

    public async Task<Cart?> GetCartByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .Include(c => c.Items)
                .ThenInclude(i => i.Variant)
            .Include(c=>c.Items)
            .ThenInclude(i => i.Product.Images)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "Active", cancellationToken);
    }

    public async Task<Cart?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .Include(c => c.Items)
                .ThenInclude(i => i.Variant)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task AddAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        await _context.Carts.AddAsync(cart, cancellationToken);
    }

    public void Update(Cart cart)
    {
        _context.Carts.Update(cart);
    }
    
    public async Task<Cart?> GetCartWithItemsAsync(long cartId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .Include(c => c.Items)
                .ThenInclude(i => i.Variant)
            .FirstOrDefaultAsync(c => c.Id == cartId, cancellationToken);
    }
    
    public async Task<CartItem?> GetCartItemAsync(long cartId, long productId, long? variantId, CancellationToken cancellationToken = default)
    {
        return await _context.CartItems
            .FirstOrDefaultAsync(i => i.CartId == cartId && 
                               i.ProductId == productId && 
                               i.VariantId == variantId, cancellationToken);
    }

    public async Task<CartItem?> GetCartItemByIdAsync(long cartItemId, CancellationToken cancellationToken = default)
    {
        return await _context.CartItems
            .Include(i => i.Product)
                .ThenInclude(p => p.Images)
            .Include(i => i.Variant)
            .FirstOrDefaultAsync(i => i.Id == cartItemId, cancellationToken);
    }

    public void UpdateCartItem(CartItem item)
    {
        _context.CartItems.Update(item);
    }
    
    public void RemoveItem(CartItem item)
    {
        _context.CartItems.Remove(item);
    }
    
    public async Task<bool> ExistsAsync(long cartId, CancellationToken cancellationToken = default)
    {
        return await _context.Carts.AnyAsync(c => c.Id == cartId, cancellationToken);
    }
    
    public void Delete(Cart cart)
    {
        _context.Carts.Remove(cart);
    }
    
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}