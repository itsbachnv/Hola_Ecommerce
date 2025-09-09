using FluentValidation;
using Ecommer.Application.Variants.Commands;
using Ecommer.Application.Abstractions.Variants;

namespace Ecommer.Application.Variants.Validators;

public class CreateVariantValidator : AbstractValidator<CreateVariant>
{
    private readonly IVariantRepository _variantRepository;

    public CreateVariantValidator(IVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;

        RuleFor(x => x.Variant.ProductId)
            .GreaterThan(0)
            .WithMessage("ProductId must be greater than 0.");

        RuleFor(x => x.Variant.Sku)
            .NotEmpty()
            .WithMessage("SKU is required.")
            .MaximumLength(100)
            .WithMessage("SKU cannot exceed 100 characters.")
            .MustAsync(BeUniqueSku)
            .WithMessage("SKU must be unique.");

        RuleFor(x => x.Variant.Price)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Price must be greater than or equal to 0.");

        RuleFor(x => x.Variant.CompareAtPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Variant.CompareAtPrice.HasValue)
            .WithMessage("Compare at price must be greater than or equal to 0.");

        RuleFor(x => x.Variant.StockQty)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Stock quantity must be greater than or equal to 0.");

        RuleFor(x => x.Variant.WeightGrams)
            .GreaterThan(0)
            .When(x => x.Variant.WeightGrams.HasValue)
            .WithMessage("Weight must be greater than 0.");

        RuleFor(x => x.Variant.Name)
            .MaximumLength(255)
            .When(x => !string.IsNullOrEmpty(x.Variant.Name))
            .WithMessage("Name cannot exceed 255 characters.");
    }

    private async Task<bool> BeUniqueSku(string sku, CancellationToken cancellationToken)
    {
        return !await _variantRepository.SkuExistsAsync(sku, null, cancellationToken);
    }
}
