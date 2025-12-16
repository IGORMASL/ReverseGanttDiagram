using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface IProjectRepository
    {
        Task CreateAsync(WorkProject proj);
        Task UpdateAsync(WorkProject proj);
        Task DeleteAsync(WorkProject proj);
        Task<List<WorkProject>> GetClassProjectsAsync(Guid classId);
        Task<WorkProject?> GetByIdAsync(Guid id);
    }
}
