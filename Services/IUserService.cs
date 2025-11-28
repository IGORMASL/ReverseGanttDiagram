using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface IUserService
    {
        Task<List<UserViewModel>> GetAllAsync();
        Task<UserViewModel> GetByIdAsync(Guid id);
        Task<List<ClassRoleViewModel>> GetUserClassRoles(Guid userId);
    }
}
