using GanttChartAPI.Models;
using NpgsqlTypes;

namespace GanttChartAPI.Repositories
{
    public interface ITaskRepository
    {
        Task CreateTaskAsync(ProjectTask task);
        Task UpdateTaskAsync(ProjectTask task);
        Task DeleteTaskAsync(ProjectTask task);
        Task<ProjectTask?> GetTaskByIdAsync(Guid taskId);
        Task<List<ProjectTask>> GetTeamTasksAsync(Guid teamId);
    }
}
