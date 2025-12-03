using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface IClassRelationRepository
    {
        Task<bool> IsTeacherInClassAsync(Guid userId, Guid classId);
        Task<bool> IsStudentInClassAsync(Guid userId, Guid classId);
        Task AddTeacherAsync(TeacherRelation relation);
        Task AddStudentAsync(StudentRelation relation);
        Task<List<TeacherRelation>> GetTeachersRelationsAsync(Guid userId);
        Task<List<StudentRelation>> GetStudentsRelationsAsync(Guid userId);
    }
}
