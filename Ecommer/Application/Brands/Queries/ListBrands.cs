using Ecommer.Application.Abstractions.Brands;
using Ecommer.Domain;
using MediatR;

namespace Ecommer.Application.Brands.Queries;

    public record ListBrandsQuery() : IRequest<IEnumerable<Brand>>;

    public class ListBrandsHandler : IRequestHandler<ListBrandsQuery, IEnumerable<Brand>>
    {
        private readonly IBrandRepository _brandRepository;
        public ListBrandsHandler(IBrandRepository brandRepository) => _brandRepository = brandRepository;

        public Task<IEnumerable<Brand>> Handle(ListBrandsQuery request, CancellationToken cancellationToken) =>
            _brandRepository.GetAllBrandsAsync();
    }