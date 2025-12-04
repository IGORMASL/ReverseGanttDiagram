using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GanttChartAPI.Controllers
{
    [Route("api/class")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectService _service;
        private readonly IUserContextService _userContext;
        public ProjectController(IProjectService service, IUserContextService userContext)
        {
            _service = service;
            _userContext = userContext;
        }
        [HttpPost("project")]
        [Authorize]
        public async Task<ActionResult> CreateProject(ProjectDto proj)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.CreateProjectAsync(userRole, userId, proj);
            return Ok();
        }
        [HttpPut("project")]
        [Authorize]
        public async Task<ActionResult> UpdateProject(Guid projectId, ProjectDto proj)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.UpdateProjectAsync(userRole, userId, projectId, proj);
            return Ok();
        }
        [HttpDelete("project")]
        [Authorize]
        public async Task<ActionResult> DeleteProject(Guid projectId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.DeleteProjectAsync(userRole, userId, projectId);
            return Ok();
        }
        [HttpGet("{classId}/projects")]
        [Authorize]
        public async Task<ActionResult> GetClassProjects(Guid classId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var projects = await _service.GetClassProjectsAsync(userRole, userId, classId);
            return Ok(projects);
        }
        [HttpGet("{projectId}")]
        [Authorize]
        public async Task<ActionResult> GetProjectById(Guid projectId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var project = await _service.GetProjectByIdAsync(userRole, userId, projectId);
            return Ok(project);
        }

    }
}
