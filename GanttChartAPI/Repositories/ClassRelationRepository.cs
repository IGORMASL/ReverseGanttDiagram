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
        public async Task RemoveStudentAsync(StudentRelation relation)
        {
           dbContext.AssignedTasks.RemoveRange(dbContext.AssignedTasks
               .Where(at => at.ProjectTask.Solution.Project.TopicClassId == relation.ClassId && at.UserId == relation.UserId));
           dbContext.TeamMembers.RemoveRange(dbContext.TeamMembers
               .Where(tm => tm.Team.Project.TopicClassId == relation.ClassId && tm.UserId == relation.UserId));
            dbContext.StudentRelations.Remove(relation);
           await dbContext.SaveChangesAsync();
            
        }
        public async Task RemoveTeacherAsync(TeacherRelation relation)
        {
            dbContext.AssignedTasks.RemoveRange(dbContext.AssignedTasks
               .Where(at => at.ProjectTask.Solution.Project.TopicClassId == relation.ClassId && at.UserId == relation.UserId));
            dbContext.TeamMembers.RemoveRange(dbContext.TeamMembers
                .Where(tm => tm.Team.Project.TopicClassId == relation.ClassId && tm.UserId == relation.UserId));
            dbContext.TeacherRelations.Remove(relation);
            await dbContext.SaveChangesAsync();
            
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
