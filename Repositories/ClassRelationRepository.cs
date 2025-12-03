using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class ClassRelationRepository : IClassRelationRepository
    {
        private readonly AppDbContext dbContext;

        public ClassRelationRepository(AppDbContext context)
        {
            dbContext = context;
        }
        public async Task<bool> IsStudentInClassAsync(Guid userId, Guid classId)
        {
            return await dbContext.StudentRelations
                .AnyAsync(sr => sr.UserId == userId && sr.ClassId == classId);
        }
        public async Task<bool> IsTeacherInClassAsync(Guid userId, Guid classId)
        {
            return await dbContext.TeacherRelations
                .AnyAsync(tr => tr.UserId == userId && tr.ClassId == classId);
        }
        public async Task AddStudentAsync(StudentRelation relation)
        {
            await dbContext.StudentRelations.AddAsync(relation);
            await dbContext.SaveChangesAsync();
        }
        public async Task AddTeacherAsync(TeacherRelation relation)
        {
            await dbContext.TeacherRelations.AddAsync(relation);
            await dbContext.SaveChangesAsync();
        }
        public async Task<List<TeacherRelation>> GetTeachersRelationsAsync(Guid userId)
        {
            return await dbContext.TeacherRelations
                .Include(tr => tr.TopicClass)
                .Where(tr => tr.UserId == userId)
                .ToListAsync();
        }
        public async Task<List<StudentRelation>> GetStudentsRelationsAsync(Guid userId)
        {
            return await dbContext.StudentRelations
                .Include(sr => sr.TopicClass)
                .Where(sr => sr.UserId == userId)
                .ToListAsync();
        }
    }
}
