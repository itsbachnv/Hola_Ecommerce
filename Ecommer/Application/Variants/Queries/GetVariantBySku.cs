using MediatR;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Queries;

public record GetVariantBySku(string Sku) : IRequest<VariantDto?>;

public class GetVariantBySkuHandler : IRequestHandler<GetVariantBySku, VariantDto?>
{
    private readonly IVariantRepository _variantRepository;

    public GetVariantBySkuHandler(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<VariantDto?> Handle(GetVariantBySku request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetBySkuAsync(request.Sku, cancellationToken);
        return variant?.ToDto();
    }
}
