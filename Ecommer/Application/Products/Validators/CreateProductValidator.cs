using Ecommer.Application.Products.Commands;
using FluentValidation;

namespace Ecommer.Application.Products.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    // Cho phép viết hoa/thường khác nhau
    private static readonly HashSet<string> Allowed =
        new(StringComparer.OrdinalIgnoreCase) { "ACTIVE", "DRAFT", "ARCHIVED" };

    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(255);

        RuleFor(x => x.Slug)
            .NotEmpty().MaximumLength(255);
    }
}
