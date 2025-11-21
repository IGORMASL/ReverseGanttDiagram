using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseViewModel> RegisterAsync(RegisterDto dto);
        Task<AuthResponseViewModel> LoginAsync(LoginDto dto);
    }
}
