using GanttChartAPI.DTOs;
using GanttChartAPI.ViewModels;
using System.Runtime.InteropServices;

namespace GanttChartAPI.Services
{
    public interface ITeamService
    {
        Task CreateTeamAsync(string userRole, Guid userId, TeamDto team);
        Task AddTeamMemberAsync(string userRole, Guid userId, Guid memberId, Guid teamId);
        Task <List<TeamViewModel>> GetProjectTeamsAsync(string userRole, Guid userId, Guid projectId);
    }
}
