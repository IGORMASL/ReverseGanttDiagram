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
        public async Task UpdateAsync(TopicClass topic)
        {
            dbContext.TopicClasses.Update(topic);
            await dbContext.SaveChangesAsync();
        }
        public async Task DeleteAsync(TopicClass topic) {
            dbContext.TopicClasses.Remove(topic);
            await dbContext.SaveChangesAsync();
        }
        public async Task<List<User>> GetClassTeachersAsync(Guid classId)
        {
            var topic = await dbContext.TopicClasses
                .Include(c => c.Teachers)
                .ThenInclude(tr => tr.User)
                .FirstOrDefaultAsync(c => c.Id == classId);
            var teachers = topic.Teachers.Select(tr => tr.User).ToList();
            return teachers;
        }
        public async Task<List<User>> GetClassStudentsAsync(Guid classId)
        {
            var topic = await dbContext.TopicClasses
                .Include(c => c.Students)
                .ThenInclude(sr => sr.User)
                .FirstOrDefaultAsync(c => c.Id == classId);
            var teachers = topic.Students.Select(tr => tr.User).ToList();
            return teachers;
        }
    }
}
