using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GanttChartAPI.Controllers
{
    [Route("api")]
    [ApiController]
    public class InviteController : ControllerBase
    {
        private readonly IInviteService _service;
        private readonly IUserContextService _userContext;

        public InviteController(IInviteService service, IUserContextService userContext)
        {
            _service = service;
            _userContext = userContext;
        }


        [HttpPost("class/invite/create")]
        [Authorize]
        public async Task<ActionResult> Create(Guid classId, InviteDto dto)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var inv = await _service.CreateAsync(userRole, userId, classId, dto);
            return Ok(new
            {
                inviteId = inv.Id,
                link = $"https://GanttChart/class/join?inv={inv.Id}"
            });
        }
        [HttpPost("class/invite/{inviteId}")]
        [Authorize]
        public async Task<ActionResult> Use(Guid inviteId)
        {
            var userId = _userContext.GetUserId();
            await _service.UseAsync(inviteId, userId);
            return Ok("Вы успешно добавлены в класс");
        }
        [HttpGet("invites")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<InviteViewModel>>> GetAll()
        {
            var invites = await _service.GetAllAsync();
            return Ok(invites);
        }
        [HttpGet("class/invites")]
        [Authorize]
        public async Task<ActionResult<List<InviteViewModel>>> GetClassInvites(Guid classId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var invites = await _service.GetClassInvitesAsync(userRole, userId, classId);
            return Ok(invites);
        }
    }
}
