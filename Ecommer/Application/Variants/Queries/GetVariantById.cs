using MediatR;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Queries;

public record GetVariantById(long Id) : IRequest<VariantDto?>;

public class GetVariantByIdHandler : IRequestHandler<GetVariantById, VariantDto?>
{
    private readonly IVariantRepository _variantRepository;

    public GetVariantByIdHandler(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<VariantDto?> Handle(GetVariantById request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetByIdAsync(request.Id, cancellationToken);
        return variant?.ToDto();
    }
}
