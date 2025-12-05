using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface ITaskService
    {
        Task CreateTaskAsync(string userRole, Guid userId, TaskDto task);
        Task UpdateTaskAsync(string userRole, Guid userId, Guid taskId, TaskDto task);
        Task DeleteTaskAsync(string userRole, Guid userId, Guid taskId);
        Task<TaskViewModel?> GetTaskByIdAsync(string userRole, Guid userId, Guid taskId);
        Task<List<TaskViewModel>> GetTeamTasksAsync(string userRole, Guid userId, Guid teamId);
    }
}
