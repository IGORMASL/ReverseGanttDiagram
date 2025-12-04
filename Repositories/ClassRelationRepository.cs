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
        public async Task<bool> IsUserInClassAsync(Guid userId, Guid classId)
        {
            return await dbContext.ClassRoles.AnyAsync(cr => cr.UserId == userId && cr.ClassId == classId);
        }
        public async Task<ClassRole?> GetUserClassRoleAsync(Guid userId, Guid classId)
        {
            return await dbContext.ClassRoles.FirstOrDefaultAsync(cr => cr.UserId == userId && cr.ClassId == classId);
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
        public async Task RemoveStudentAsync(Guid userId, Guid classId)
        {
            var relation = await dbContext.StudentRelations.FirstOrDefaultAsync(sr => sr.UserId == userId && sr.ClassId == classId);
            if (relation != null)
            {
                dbContext.StudentRelations.Remove(relation);
                await dbContext.SaveChangesAsync();
            }
        }
        public async Task RemoveTeacherAsync(Guid userId, Guid classId)
        {
            var relation = await dbContext.TeacherRelations.FirstOrDefaultAsync(tr => tr.UserId == userId && tr.ClassId == classId);
            if (relation != null)
            {
                dbContext.TeacherRelations.Remove(relation);
                await dbContext.SaveChangesAsync();
            }
        }
        public async Task<List<TeacherRelation>> GetUserTeachersRelationsAsync(Guid userId)
        {
            return await dbContext.TeacherRelations
                .Include(tr => tr.TopicClass)
                .Where(tr => tr.UserId == userId)
                .ToListAsync();
        }
        public async Task<List<StudentRelation>> GetUserStudentsRelationsAsync(Guid userId)
        {
            return await dbContext.StudentRelations
                .Include(sr => sr.TopicClass)
                .Where(sr => sr.UserId == userId)
                .ToListAsync();
        }
    }
}
