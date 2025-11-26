using GanttChartAPI.DTOs;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface ITopicClassService
    {
        Task<List<ClassViewModel>> GetAllAsync();
        Task<ClassViewModel> GetByIdAsync(Guid id);
        Task<ClassViewModel> CreateAsync(ClassDto dto);
        Task<ClassViewModel> UpdateAsync(Guid id, ClassDto dto);
        Task DeleteAsync(Guid id);
    }
}
