using GanttChartAPI.Data;
using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Update.Internal;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace GanttChartAPI.Repositories
{
    public class TopicClassRepository : ITopicClassRepository
    {
        private readonly AppDbContext dbContext;

        public TopicClassRepository(AppDbContext context)
        {
            dbContext = context;
        }

        public async Task<List<TopicClass>> GetAllAsync()
        {
            return await dbContext.TopicClasses.ToListAsync();
        }
        
        public async Task<TopicClass?> GetByIdAsync(Guid id)
        {
            return await dbContext.TopicClasses.FirstOrDefaultAsync(tc => tc.Id == id);
        }
        public async Task CreateAsync(TopicClass topic)
        {
            dbContext.TopicClasses.Add(topic);
            await dbContext.SaveChangesAsync();
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
        public async Task<bool> IsUserInClassAsync(Guid userId, Guid classId)
        {
            var teacher = await dbContext.TeacherRelations
                .AnyAsync(tr => tr.UserId == userId && tr.ClassId == classId);
            var student = await dbContext.StudentRelations
                .AnyAsync(sr => sr.UserId == userId && sr.ClassId == classId);
            return teacher || student;
        }
        public async Task UpdateAsync(Guid id, ClassDto dto)
        {
            var topic = await dbContext.TopicClasses.FirstOrDefaultAsync(x => x.Id == id);

            if (topic == null)
                throw new KeyNotFoundException("Класс не найден");

            topic.Title = dto.Title;
            topic.Description = dto.Description;

            await dbContext.SaveChangesAsync();
        }
        public async Task DeleteAsync(TopicClass topic) {
            dbContext.TopicClasses.Remove(topic);
            await dbContext.SaveChangesAsync();
        }
    }
}
