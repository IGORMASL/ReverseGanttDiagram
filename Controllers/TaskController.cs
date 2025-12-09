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
        public async Task<ActionResult<TaskViewModel>> CreateTask([FromBody] CreateTaskDto taskDto)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var createdTask = await _service.CreateTaskAsync(userRole, userId, taskDto);
            return CreatedAtAction(nameof(GetTaskById), new { taskId = createdTask.Id }, createdTask);
        }

        [HttpPut("{taskId}")]
        [Authorize]
        public async Task<ActionResult<TaskViewModel>> UpdateTask([FromRoute] Guid taskId, [FromBody] UpdateTaskDto taskDto)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var updatedTask = await _service.UpdateTaskAsync(userRole, userId, taskId, taskDto);
            return Ok(updatedTask);
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
        [HttpGet("{taskId}")]
        [Authorize]
        public async Task<ActionResult<TaskViewModel>> GetTaskById([FromRoute] Guid taskId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var task = await _service.GetTaskByIdAsync(userRole, userId, taskId);
            return Ok(task);
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
