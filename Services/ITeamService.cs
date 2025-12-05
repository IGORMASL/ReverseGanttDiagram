using GanttChartAPI.DTOs;
using System.Runtime.InteropServices;

namespace GanttChartAPI.Services
{
    public interface ITeamService
    {
        Task CreateTeamAsync(string userRole, Guid userId, TeamDto team);
        Task AddTeamMemberAsync(string userRole, Guid userId, Guid memberId, Guid teamId);
    }
}
