using GanttChartAPI.DTOs;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;

namespace GanttChartAPI.Controllers
{
    [Route("api/task")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _service;
        private readonly IUserContextService _userContext;
        public TaskController(ITaskService service, IUserContextService userContext)
        {
            _service = service;
            _userContext = userContext;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateTask([FromBody] TaskDto taskDto)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.CreateTaskAsync(userRole, userId, taskDto);
            return Ok();
        }

        [HttpPut("{taskId}")]
        [Authorize]
        public async Task<ActionResult> UpdateTask([FromRoute] Guid taskId, [FromBody] TaskDto taskDto)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.UpdateTaskAsync(userRole, userId, taskId, taskDto);
            return Ok();
        }

        [HttpDelete("{taskId}")]
        [Authorize]
        public async Task<ActionResult> DeleteTask([FromRoute] Guid taskId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.DeleteTaskAsync(userRole, userId, taskId);
            return Ok();
        }

        [HttpGet("team/{teamId}")]
        [Authorize]
        public async Task<ActionResult<List<TaskViewModel>>> GetTeamTasks([FromRoute] Guid teamId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var tasks = await _service.GetTeamTasksAsync(userRole, userId, teamId);
            return Ok(tasks);
        }
    }
}
