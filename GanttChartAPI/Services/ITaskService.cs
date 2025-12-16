using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public interface ITaskService
    {
        Task<TaskViewModel> CreateTaskAsync(string userRole, Guid userId, CreateTaskDto task);
        Task<TaskViewModel> UpdateTaskAsync(string userRole, Guid userId, Guid taskId, UpdateTaskDto task);
        Task DeleteTaskAsync(string userRole, Guid userId, Guid taskId);
        Task<TaskViewModel?> GetTaskByIdAsync(string userRole, Guid userId, Guid taskId);
        Task<List<TaskViewModel>> GetTeamTasksAsync(string userRole, Guid userId, Guid teamId);
    }
}
