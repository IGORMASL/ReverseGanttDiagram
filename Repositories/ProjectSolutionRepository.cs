using GanttChartAPI.Data;
using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public class ProjectSolutionRepository : IProjectSolutionRepository
    {
        private readonly AppDbContext _context;
        public ProjectSolutionRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddTeamSollutionAsync(ProjectSolution projectSolution)
        {
            await _context.ProjectSolutions.AddAsync(projectSolution);
            await _context.SaveChangesAsync();
        }
    }
}
