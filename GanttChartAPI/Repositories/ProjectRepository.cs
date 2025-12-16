using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;
        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task CreateAsync(WorkProject proj)
        {
            await _context.Projects.AddAsync(proj);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(WorkProject proj)
        {
            _context.Projects.Update(proj);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(WorkProject proj) { 
            _context.Projects.Remove(proj);
            await _context.SaveChangesAsync();
        }
        public async Task<WorkProject?> GetByIdAsync(Guid id)
        {
            return await _context.Projects.FirstOrDefaultAsync(tp => tp.Id == id);
        }
        public async Task<List<WorkProject>> GetClassProjectsAsync(Guid classId)
        {
            return await _context.Projects.Where(tp => tp.TopicClassId == classId).ToListAsync();
        }
    }
}
