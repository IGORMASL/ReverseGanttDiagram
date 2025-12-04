namespace GanttChartAPI.Services
{
    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public Guid GetUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("Unauthorized(token not found)");
            }
            return Guid.Parse(userIdClaim.Value);
        }
        public string GetUserRole()
        {
            var userRoleClaim = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            if (userRoleClaim == null)
            {
                throw new UnauthorizedAccessException("Unauthorized(token not found)");
            }
            return userRoleClaim.Value;
        }
    }
}
