using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class ProjectSolutionRepository : IProjectSolutionRepository
    {
        private readonly AppDbContext _context;
        public ProjectSolutionRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task CreateAsync(ProjectSolution projectSolution)
        {
            await _context.ProjectSolutions.AddAsync(projectSolution);
            await _context.SaveChangesAsync();
        }
        public async Task<ProjectSolution?> GetByIdAsync(Guid solutionId)
        {
            return await _context.ProjectSolutions
                                 .Include(ps => ps.Team)
                                 .Include(ps => ps.Project)
                                 .FirstOrDefaultAsync(ps => ps.Id == solutionId);
        }
        public async Task<List<ProjectSolution>> GetUserClassSolutionsAsync(Guid userId, Guid classId)
        {
            return await _context.ProjectSolutions
                            .Include(ps => ps.Team)
                            .ThenInclude(t => t.Members)
                            .Include(ps => ps.Project)
                            .Where(ps => ps.Project.TopicClassId == classId &&
                            ps.Team != null &&
                            ps.Team.Members.Any(m => m.UserId == userId))
                            .ToListAsync();
        }
    }
}
