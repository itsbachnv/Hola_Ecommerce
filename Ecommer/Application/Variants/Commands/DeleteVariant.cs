using MediatR;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Commands;

public record DeleteVariant(long Id) : IRequest<bool>;

public class DeleteVariantHandler : IRequestHandler<DeleteVariant, bool>
{
    private readonly IVariantRepository _variantRepository;

    public DeleteVariantHandler(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public async Task<bool> Handle(DeleteVariant request, CancellationToken cancellationToken)
    {
        var exists = await _variantRepository.ExistsAsync(request.Id, cancellationToken);
        if (!exists)
        {
            return false;
        }

        await _variantRepository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}
