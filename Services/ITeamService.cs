using GanttChartAPI.DTOs;
using GanttChartAPI.ViewModels;
using System.Runtime.InteropServices;

namespace GanttChartAPI.Services
{
    public interface ITeamService
    {
        Task<TeamViewModel> CreateTeamAsync(string userRole, Guid userId, CreateTeamDto team);
        Task<TeamViewModel> UpdateTeamAsync(string userRole, Guid userId, Guid teamId, UpdateTeamDto team);
        Task<TeamViewModel> AddTeamMemberAsync(string userRole, Guid userId, Guid memberId, Guid teamId);
        Task <List<TeamViewModel>> GetProjectTeamsAsync(string userRole, Guid userId, Guid projectId);
        Task<TeamViewModel> GetTeamByIdAsync(string userRole, Guid userId, Guid teamId);
    }
}
