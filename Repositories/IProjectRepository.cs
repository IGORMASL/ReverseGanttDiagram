using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface IProjectRepository
    {
        Task CreateAsync(TaskProject proj);
        Task UpdateAsync(TaskProject proj);
        Task DeleteAsync(TaskProject proj);
        Task<List<TaskProject>> GetClassProjectsAsync(Guid classId);
        Task<TaskProject?> GetByIdAsync(Guid id);
    }
}
