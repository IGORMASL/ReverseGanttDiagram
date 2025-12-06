using GanttChartAPI.DTOs;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GanttChartAPI.Controllers
{
    [Route("api/team")]
    [ApiController]
    public class TeamController : ControllerBase
    {
        private readonly ITeamService _service;
        private readonly IUserContextService _userContext;
        public TeamController(ITeamService service, IUserContextService userContext)
        {
            _service = service;
            _userContext = userContext;
        }
        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateTeam(TeamDto team)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            await _service.CreateTeamAsync(userRole, userId, team);
            return Ok();
        }
        [HttpGet("project")]
        [Authorize]
        public async Task<ActionResult<List<TeamViewModel>>> GetProjectTeams(Guid projectId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var teams = await _service.GetProjectTeamsAsync(userRole, userId, projectId);
            return Ok(teams);
        }
        [HttpPut("members")]
        [Authorize]
        public async Task<ActionResult> AddUserToTeam(Guid teamId, Guid userId)
        {
            var requesterId = _userContext.GetUserId();
            var requesterRole = _userContext.GetUserRole();
            await _service.AddTeamMemberAsync(requesterRole, requesterId, userId, teamId);
            return Ok();
        }
        [HttpGet("{teamId}")]
        [Authorize]
        public async Task<ActionResult<TeamViewModel>> GetTeamById(Guid teamId)
        {
            var userId = _userContext.GetUserId();
            var userRole = _userContext.GetUserRole();
            var members = await _service.GetTeamByIdAsync(userRole, userId, teamId);
            return Ok(members);
        }
    }
}
