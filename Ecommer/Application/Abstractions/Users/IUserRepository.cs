using Ecommer.Application.Abstractions.Variants;
using Ecommer.Application.Users.Dtos;
using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Users;

public interface IUserRepository
{
    Task<IReadOnlyList<long>> GetAdminUserIdsAsync(CancellationToken ct = default);
    Task<IEnumerable<User>> GetAllUserAsync(CancellationToken ct = default);
    Task<User?> FindAsync(long id, CancellationToken ct = default);
    Task<User?> FindByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, long? excludeId = null, CancellationToken ct = default);

    Task AddAsync(User entity, CancellationToken ct = default);
    void Update(User entity);
    void Remove(User entity); // hard delete (nếu có soft delete thì đổi thành Disable)

    Task<int> SaveChangesAsync(CancellationToken ct = default);

    // Listing (search/role/sort/paging)
    Task<PagedResult<UserDto>> ListAsync(
        string? search,
        string? role,
        string? sort,
        int page,
        int pageSize,
        CancellationToken ct = default);
    bool Verify(string inputPassword, string storedHash);
    
}