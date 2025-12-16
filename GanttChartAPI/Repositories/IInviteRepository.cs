using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface IInviteRepository
    {
        Task<ClassInvite?> GetByIdAsync (Guid id);
        Task AddAsync(ClassInvite invite);
        Task UpdateAsync(ClassInvite invite);
        Task<List<ClassInvite>> GetAllAsync();
        Task<List<ClassInvite>> GetClassInvitesAsync(Guid classId);
    }
}
