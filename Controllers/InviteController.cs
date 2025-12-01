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
    [Route("api/class/invite")]
    [ApiController]
    public class InviteController : ControllerBase
    {
        private readonly IInviteService _service;
        public InviteController(IInviteService service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new UnauthorizedException("Unauthorized(token not found)");
            }
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpPost("create/{classId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Create(Guid classId, InviteDto dto)
        {
            var inv = await _service.CreateAsync(classId, dto);
            return Ok(new
            {
                inviteId = inv.Id,
                link = $"https://GanttChart/join?inv={inv.Id}"
            });
        }
        [HttpPost("{inviteId}")]
        [Authorize]
        public async Task<ActionResult> Use(Guid inviteId)
        {
            var userId = GetUserId();
            await _service.UseAsync(inviteId, userId);
            return Ok("Вы успешно добавлены в класс");
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<InviteViewModel>>> GetAll()
        {
            var invites =  await _service.GetAllAsync();
            return Ok(invites);
        }
    }
}
