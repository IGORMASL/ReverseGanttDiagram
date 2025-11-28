using GanttChartAPI.DTOs;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GanttChartAPI.Controllers
{
    [Route("api/invite")]
    [ApiController]
    public class InviteController : ControllerBase
    {
        private readonly IInviteService _service;
        public InviteController(IInviteService service)
        {
            _service = service;
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
        [HttpPost("use")]
        [Authorize]
        public async Task<ActionResult> Use(AllowInviteDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("Пользователь не найден в токене");
            var userId = Guid.Parse(userIdClaim.Value);
            await _service.UseAsync(dto.InviteId, userId);
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
