using MediatR;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Commands;

public record CreateVariant(CreateVariantDto Variant) : IRequest<VariantDto>;

public class CreateVariantHandler : IRequestHandler<CreateVariant, VariantDto>
{
    private readonly IVariantRepository _variantRepository;

    public CreateVariantHandler(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<VariantDto> Handle(CreateVariant request, CancellationToken cancellationToken)
    {
        var variant = request.Variant.ToEntity();
        var createdVariant = await _variantRepository.CreateAsync(variant, cancellationToken);
        return createdVariant.ToDto();
    }
}
