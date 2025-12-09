
using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters.Xml;
using Microsoft.AspNetCore.Mvc.Routing;
using System.ComponentModel.Design;
using System.Data;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace GanttChartAPI.Controllers
{
    [Route("api/class")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly ITopicClassService _service;
        private readonly IUserContextService _userContext;

        public ClassController(ITopicClassService service, IUserContextService userContext)
        {
            _service = service;
            _userContext = userContext;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassViewModel>> Create(ClassDto dto)
        {
            var topic = await _service.CreateAsync(dto);
            return Ok(topic);
        }

        [HttpPut]
        [Authorize]
        public async Task<ActionResult<ClassViewModel>> Update(Guid classId, ClassDto dto)
        {
            var userRole = _userContext.GetUserRole();
            var userId = _userContext.GetUserId();
            var topic = await _service.UpdateAsync(userRole, userId, classId, dto);
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
        [Authorize]
        public async Task<ActionResult<ClassViewModel>> GetById(Guid id)
        {
            var userRole = _userContext.GetUserRole();
            var userId = _userContext.GetUserId();
            var topic = await _service.GetByIdAsync(userRole, userId, id);
            return Ok(topic);
        }
        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<UserClassViewModel>> GetUserClasses()
        {
            var userId = _userContext.GetUserId();
            var classes = await _service.GetUserClassesAsync(userId);
            return Ok(classes);
        }
        [HttpGet("members/{classId}")]
        [Authorize]
        public async Task<ActionResult<List<ClassMemberViewModel>>> GetClassMembers(Guid classId)
        {
            var userRole = _userContext.GetUserRole();
            var userId = _userContext.GetUserId();
            var members = await _service.GetClassMembersAsync(userRole, userId, classId);
            return Ok(members);
        }
        [HttpPut("members/{classId}")]
        [Authorize]
        public async Task<ActionResult> AddMemberByEmail(Guid classId, string memberEmail, string memberClassRole)
        {
            var requesterId = _userContext.GetUserId();
            var requesterRole = _userContext.GetUserRole();
            await _service.AddClassMemberByEmailAsync(requesterRole, requesterId, classId, memberEmail, memberClassRole);
            return Ok();
        }
    }
}
