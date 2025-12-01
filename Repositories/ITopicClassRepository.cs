using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Repositories
{
    public interface ITopicClassRepository
    {
        Task CreateAsync(TopicClass topic);
        Task UpdateAsync(Guid id, ClassDto dto);
        Task DeleteAsync(TopicClass topic);
        Task<TopicClass> GetByIdAsync(Guid id);
        Task<List<TopicClass>> GetAllAsync();
        Task AddTeacherAsync(TeacherRelation relation); 
        Task AddStudentAsync(StudentRelation relation);
        Task<List<TeacherRelation>> GetTeachersRelationsAsync(Guid userId);
        Task<List<StudentRelation>> GetStudentsRelationsAsync(Guid userId);
        Task<bool> IsUserInClassAsync(Guid userId, Guid classId);
    }
}
