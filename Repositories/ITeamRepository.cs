using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface ITeamRepository
    {
        Task CreateTeamAsync (Team team);
        Task UpdateTeamAsync (Team team);
        Task DeleteTeamAsync (Team team);
        Task<Team?> GetTeamByIdAsync (Guid teamId);
        Task<List<Team>> GetProjectTeamsAsync (Guid projectId);
        Task<Team> GetUserProjectTeamAsync (Guid projectId, Guid userId);
    }
}
