using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private readonly AppDbContext _context;
        public TeamRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Team> CreateAsync(Team team)
        {
            await _context.Teams.AddAsync(team);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(team.Id);
        }
        public async Task<Team> UpdateAsync(Team team)
        {
            _context.Teams.Update(team);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(team.Id);
        }
        public async Task DeleteAsync(Team team)
        {
            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
        }
        public async Task<Team?> GetByIdAsync(Guid teamId)
        {
            return await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .Include(t => t.Solution)
                .FirstOrDefaultAsync(t => t.Id == teamId);
        }
        public async Task<List<Team>> GetProjectTeamsAsync(Guid projectId)
        {
            return await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .Where(t => t.ProjectId == projectId).ToListAsync();
        }
        public async Task<Team?> GetUserProjectTeamAsync(Guid projectId, Guid userId)
        {
            return await Task.FromResult(_context.Teams.FirstOrDefault(t => t.ProjectId == projectId && 
                t.Members.Any(m => m.UserId == userId)));
        }
        public async Task AddTeamMemberAsync(TeamMember membership)
        {
            await _context.TeamMembers.AddAsync(membership);
            await _context.SaveChangesAsync();
        }
    }
}
