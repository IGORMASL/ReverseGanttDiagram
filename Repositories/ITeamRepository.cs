using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface ITeamRepository
    {
        Task CreateTeamAsync (Team team);
        Task UpdateTeamAsync (Team team);
        Task DeleteTeamAsync (Team team);
        Task<Team?> GetTeamByIdAsync (Guid teamId);
        Task<List<Team>> GetProjectTeamsIdAsync (Guid projectId);
        Task<Team> GetProjectUserTeamAsync (Guid projectId, Guid userId);
    }
}
