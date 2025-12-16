using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Repositories
{
    public interface ITopicClassRepository
    {
        Task CreateAsync(TopicClass topic);
        Task UpdateAsync(TopicClass topic);
        Task DeleteAsync(TopicClass topic);
        Task<TopicClass?> GetByIdAsync(Guid id);
        Task<List<TopicClass>> GetAllAsync();
        Task<List<User>> GetClassTeachersAsync(Guid classId);
        Task<List<User>> GetClassStudentsAsync(Guid classId);
    }
}
