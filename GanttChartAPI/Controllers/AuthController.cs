using GanttChartAPI.Services;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GanttChartAPI.Controllers
{
    [Route("api/Auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;
        public AuthController(IAuthService service)
        {
            _service = service;
        }
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseViewModel>> Register([FromBody] DTOs.RegisterDto dto)
        {
           var result = await _service.RegisterAsync(dto);
           return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseViewModel>> Login([FromBody] DTOs.LoginDto dto)
        {
            var result = await _service.LoginAsync(dto);
            return Ok(result);
        }
    }
}
