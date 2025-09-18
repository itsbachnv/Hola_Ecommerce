using Application.Usecases.Guests.ViewAllGuestCommand;
using Application.Usecases.UserCommon.ViewAllUserChat;
using Ecommer.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommer.Controllers;

[Route("api/user")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [HttpGet("allUsersChat")]
    [Authorize]
    public async Task<IActionResult> GetAllUsers()
    {
        var result = await _mediator.Send(new ViewAllUsersChatCommand());
        return Ok(result);
    }
    
    [HttpGet("allGuestsChat")]
    public async Task<IActionResult> AllGuestsChat()
    {
        var result = await _mediator.Send(new ViewAllGuestsChatCommand());
        return Ok(result);
    }
}

