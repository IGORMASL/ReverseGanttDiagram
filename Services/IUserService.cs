using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface IUserService
    {
        Task<List<UserViewModel>> GetAllAsync();
        Task<UserViewModel> GetByIdAsync(Guid id);
        Task<UserViewModel> GetByEmailAsync(string email);
        Task<List<ClassRoleViewModel>> GetUserClassRolesAsync(Guid userId);
    }
}
