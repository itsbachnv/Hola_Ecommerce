using Ecommer.Domain;
using Ecommer.Infrastructure;

namespace Ecommer.Application.Abstractions.Brands;

public class BrandRepository : IBrandRepository
{
    private readonly AppDbContext _dbContext;
    public BrandRepository(AppDbContext dbContext) => _dbContext = dbContext;
    public async Task<IEnumerable<Brand>> GetAllBrandsAsync()
    {
        return _dbContext.Brands.ToList();
    }
}