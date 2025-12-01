
using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System.ComponentModel.Design;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace GanttChartAPI.Controllers
{
    [Route("api/class")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly ITopicClassService _service;

        public ClassController(ITopicClassService service)
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassViewModel>> Create(ClassDto dto)
        {
            var topic = await _service.CreateAsync(dto);
            return Ok(topic);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassViewModel>> Update(Guid id, ClassDto dto)
        {
            var topic = await _service.UpdateAsync(id, dto);
            return Ok(topic);
        }
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return Ok();
        }
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<ClassViewModel>>> GetAll()
        {
            var topicList = await _service.GetAllAsync();
            return Ok(topicList);
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassViewModel>> GetById(Guid id)
        {
            var topic = await _service.GetByIdAsync(id);
            return Ok(topic);
        }
        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<UserClassViewModel>> GetUserClasses()
        {
            var userId = GetUserId();
            var classes = await _service.GetUserClassesAsync(userId);
            return Ok(classes);
        }

    }
}
