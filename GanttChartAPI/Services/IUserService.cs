using GanttChartAPI.ViewModels;
using GanttChartAPI.DTOs;

namespace GanttChartAPI.Services
{
    public interface IUserService
    {
        Task<List<UserViewModel>> GetAllAsync();
        Task<UserViewModel> GetByIdAsync(Guid id);
        Task<UserViewModel> GetByEmailAsync(string email);
        Task<List<ClassRoleViewModel>> GetUserClassRolesAsync(Guid userId);
        Task UpdateNameAsync(Guid userId, UpdateNameDto dto);
        Task<bool> VerifyPasswordAsync(Guid userId, VerifyPasswordDto dto);
        Task UpdatePasswordAsync(Guid userId, UpdatePasswordDto dto);
    }
}
