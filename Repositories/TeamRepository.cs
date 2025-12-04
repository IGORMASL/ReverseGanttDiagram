using GanttChartAPI.Data;
using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private readonly AppDbContext _context;
        public TeamRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task CreateTeamAsync(Team team)
        {
            await _context.Teams.AddAsync(team);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateTeamAsync(Team team)
        {
            _context.Teams.Update(team);
            await _context.SaveChangesAsync();
        }
        public async Task DeleteTeamAsync(Team team)
        {
            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
        }
        public async Task<Team?> GetTeamByIdAsync(Guid teamId)
        {
            return await _context.Teams.FindAsync(teamId);
        }
        public async Task<List<Team>> GetProjectTeamsAsync(Guid projectId)
        {
            return await Task.FromResult(_context.Teams.Where(t => t.ProjectId == projectId).ToList());
        }
        public async Task<Team?> GetUserProjectTeamAsync(Guid projectId, Guid userId)
        {
            return await Task.FromResult(_context.Teams.FirstOrDefault(t => t.ProjectId == projectId && 
                t.Members.Any(m => m.UserId == userId)));
        }
    }
}
