using FluentValidation;

namespace Ecommer.Application.Notifications.Commands;

public class SendNotificationValidator : AbstractValidator<SendNotificationCommand>
{
    public SendNotificationValidator()
    {
        RuleFor(x => x.Title).MaximumLength(255);
        RuleFor(x => x.Type).MaximumLength(50);
        RuleFor(x => x.Message).NotEmpty().WithMessage("Message is required.");
        RuleFor(x => x.RecipientUserIds)
            .NotEmpty().WithMessage("At least one recipient is required.");
    }
}