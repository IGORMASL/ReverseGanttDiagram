using GanttChartAPI.DTOs;
using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface ITopicClassRepository
    {
        Task<TopicClass> CreateAsync(TopicClass topic);
        Task UpdateAsync(Guid id, ClassDto dto);
        Task DeleteAsync(TopicClass topic);
        Task<TopicClass> GetByIdAsync(Guid id);
        Task<List<TopicClass>> GetAllAsync();
        Task AddTeacherAsync(TeacherRelation relation);
        Task AddStudentAsync(StudentRelation relation);

    }
}
