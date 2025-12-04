using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface IInviteService
    {
        Task<ClassInvite> CreateAsync (string creatorRole, Guid creatorId, Guid classId, InviteDto invite);
        Task UseAsync(Guid inviteId, Guid userId);
        Task<List<InviteViewModel>> GetAllAsync();
        Task<List<InviteViewModel>> GetClassInvitesAsync(string userRole, Guid userId, Guid classId);
    }
}
