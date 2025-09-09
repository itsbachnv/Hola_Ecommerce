using MediatR;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Queries;

public record GetVariantsByProductId(long ProductId) : IRequest<IEnumerable<VariantDto>>;

public class GetVariantsByProductIdHandler : IRequestHandler<GetVariantsByProductId, IEnumerable<VariantDto>>
{
    private readonly IVariantRepository _variantRepository;

    public GetVariantsByProductIdHandler(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<IEnumerable<VariantDto>> Handle(GetVariantsByProductId request, CancellationToken cancellationToken)
    {
        var variants = await _variantRepository.GetByProductIdAsync(request.ProductId, cancellationToken);
        return variants.Select(v => v.ToDto());
    }
}
