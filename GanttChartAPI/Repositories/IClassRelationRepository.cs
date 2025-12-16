using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface IClassRelationRepository
    {
        Task<bool> IsUserInClassAsync(Guid userId, Guid classId);
        Task<ClassRole?> GetUserClassRoleAsync(Guid userId, Guid classId);
        Task AddTeacherAsync(TeacherRelation relation);
        Task AddStudentAsync(StudentRelation relation);
        Task RemoveTeacherAsync(TeacherRelation teacherRelation);
        Task RemoveStudentAsync(StudentRelation studentRelation);
        Task<List<TeacherRelation>> GetUserTeachersRelationsAsync(Guid userId);
        Task<List<StudentRelation>> GetUserStudentsRelationsAsync(Guid userId);
    }
}
