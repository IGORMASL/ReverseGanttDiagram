using GanttChartAPI.DTOs;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface ITopicClassService
    {
        Task<List<ClassViewModel>> GetAllAsync();
        Task<ClassViewModel> GetByIdAsync(string userRole, Guid userId, Guid classId);
        Task<ClassViewModel> CreateAsync(ClassDto dto);
        Task<ClassViewModel> UpdateAsync(string userRole, Guid userId, Guid classId, ClassDto dto);
        Task DeleteAsync(Guid id);
        Task<List<UserClassViewModel>> GetUserClassesAsync(Guid userId);
    }
}
