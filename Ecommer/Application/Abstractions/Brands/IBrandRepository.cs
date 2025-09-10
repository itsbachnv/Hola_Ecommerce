using Ecommer.Domain;

namespace Ecommer.Application.Abstractions.Brands;

public interface IBrandRepository
{
    Task<IEnumerable<Brand>> GetAllBrandsAsync();
}