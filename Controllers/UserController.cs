using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Validations;
using System.Security.Claims;

namespace GanttChartAPI.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly ILogger<UserController> _logger;
        public UserController(IUserService service, ILogger<UserController> logger)
        {
            _service = service;
            _logger = logger;
        }
        private Guid GetUserIdFromClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new UnauthorizedException("Unauthorized(token not found)");
            }
            return Guid.Parse(userIdClaim.Value);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserViewModel>>> GetAll()
        {
            var users = await _service.GetAllAsync();
            return Ok(users);
        }
        [HttpGet("roles")]
        [Authorize]
        public async Task<ActionResult<List<ClassRoleViewModel>>> GetRoles()
        {
            var userId = GetUserIdFromClaims();
            var roles = await _service.GetUserClassRolesAsync(userId);
            return Ok(roles);
        }
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserViewModel>> GetProfile()
        {
            var userId = GetUserIdFromClaims();
            var profile = await _service.GetByIdAsync(userId);
            return Ok(profile);
        }
        [HttpPut("profile/name")]
        [Authorize]
        public async Task<ActionResult> UpdateName([FromBody] UpdateNameDto dto)
        {
            var userId = GetUserIdFromClaims();
            await _service.UpdateNameAsync(userId, dto);
            return NoContent();
        }
        [HttpPost("profile/verify-password")]
        [Authorize]
        public async Task<ActionResult<bool>> VerifyPassword([FromBody] VerifyPasswordDto dto)
        {
            var userId = GetUserIdFromClaims();
            var isValid = await _service.VerifyPasswordAsync(userId, dto);
            return Ok(isValid);
        }
        [HttpPut("profile/password")]
        [Authorize]
        public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordDto dto)
        {
            var userId = GetUserIdFromClaims();
            await _service.UpdatePasswordAsync(userId, dto);
            return Ok();
        }
    }
}
