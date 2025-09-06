using Ecommer.Application.Users.Dtos;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Ecommer.Application.Abstractions.Users;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;
    public UserRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<long>> GetAdminUserIdsAsync(CancellationToken ct = default)
        => await _db.Users
            .Where(u => u.Role == "Admin")
            .Select(u => u.Id)
            .ToListAsync(ct);

    public Task<User?> FindAsync(long id, CancellationToken ct = default) =>
        _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<User?> FindByEmailAsync(string email, CancellationToken ct = default) =>
        _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email == email, ct);

    public Task<bool> EmailExistsAsync(string email, long? excludeId = null, CancellationToken ct = default) =>
        _db.Users.AnyAsync(u => u.Email == email && (excludeId == null || u.Id != excludeId), ct);

    public async Task AddAsync(User entity, CancellationToken ct = default) =>
        await _db.Users.AddAsync(entity, ct);

    public void Update(User entity) => _db.Users.Update(entity);

    public void Remove(User entity) => _db.Users.Remove(entity);

    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _db.SaveChangesAsync(ct);

    public async Task<PagedResult<UserDto>> ListAsync(
        string? search,
        string? role,
        string? sort,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize <= 0) pageSize = 20;
        if (pageSize > 200) pageSize = 200;

        IQueryable<User> q = _db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            // Postgres: ILIKE; nếu SQL Server: ToLower().Contains
            q = q.Where(u =>
                EF.Functions.ILike(u.Email, $"%{s}%") ||
                EF.Functions.ILike(u.FullName!, $"%{s}%"));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            q = q.Where(u => u.Role == role);
        }

        q = (sort ?? "").ToLowerInvariant() switch
        {
            "name_asc"  => q.OrderBy(u => u.FullName),
            "name_desc" => q.OrderByDescending(u => u.FullName),
            "newest"    => q.OrderByDescending(u => u.CreatedAt),
            "oldest"    => q.OrderBy(u => u.CreatedAt),
            _           => q.OrderByDescending(u => u.Id)
        };

        var total = await q.CountAsync(ct);

        var items = await q.Skip((page - 1) * pageSize)
                           .Take(pageSize)
                           .Select(u => u.ToDto())
                           .ToListAsync(ct);

        return new PagedResult<UserDto>(items, total, page, pageSize);
    }
    
    public bool Verify(string inputPassword, string storedHash)
    {
        bool checkPassword = BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
        return checkPassword;
    }
}