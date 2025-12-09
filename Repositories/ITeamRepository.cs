using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface ITeamRepository
    {
        Task<Team> CreateAsync (Team team);
        Task<Team> UpdateAsync (Team team);
        Task DeleteAsync (Team team);
        Task<Team?> GetByIdAsync (Guid teamId);
        Task<List<Team>> GetProjectTeamsAsync (Guid projectId);
        Task<Team> GetUserProjectTeamAsync (Guid projectId, Guid userId);
        Task AddTeamMemberAsync(TeamMember membership);
    }
}
