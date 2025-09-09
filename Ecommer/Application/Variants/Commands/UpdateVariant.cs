using MediatR;
using Ecommer.Application.Variants.Dtos;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Commands;

public record UpdateVariant(UpdateVariantDto Variant) : IRequest<VariantDto>;

public class UpdateVariantHandler : IRequestHandler<UpdateVariant, VariantDto>
{
    private readonly IVariantRepository _variantRepository;

    public UpdateVariantHandler(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<VariantDto> Handle(UpdateVariant request, CancellationToken cancellationToken)
    {
        var existingVariant = await _variantRepository.GetByIdAsync(request.Variant.Id, cancellationToken);
        if (existingVariant == null)
        {
            throw new InvalidOperationException($"Variant with ID {request.Variant.Id} not found.");
        }

        request.Variant.UpdateEntity(existingVariant);
        var updatedVariant = await _variantRepository.UpdateAsync(existingVariant, cancellationToken);
        return updatedVariant.ToDto();
    }
}
