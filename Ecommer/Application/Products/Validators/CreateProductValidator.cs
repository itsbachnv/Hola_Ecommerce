using Ecommer.Application.Products.Commands;
using FluentValidation;

namespace Ecommer.Application.Products.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    // Cho phép viết hoa/thường khác nhau
    private static readonly HashSet<string> Allowed =
        new(StringComparer.OrdinalIgnoreCase) { "Active", "Draft", "Archived" };

    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(255);

        RuleFor(x => x.Slug)
            .NotEmpty().MaximumLength(255);

        // Quan trọng: Trim và cho phép null/empty => Handler sẽ default "Active"
        RuleFor(x => x.Status)
            .Must(s => string.IsNullOrWhiteSpace(s) || Allowed.Contains(s.Trim()))
            .WithMessage("Status must be one of: Active, Draft, Archived.");
    }
}
