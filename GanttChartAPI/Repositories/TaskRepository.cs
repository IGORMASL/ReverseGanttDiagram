using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly AppDbContext _context;
        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task CreateTaskAsync(ProjectTask task)
        {
            await _context.ProjectTasks.AddAsync(task);
            await _context.SaveChangesAsync();
        }
        public async Task ClearTaskDependenciesAsync(Guid taskId)
        {
            var existingDependencies = _context.TaskDependencies
                                               .Where(td => td.TaskId == taskId);
            _context.TaskDependencies.RemoveRange(existingDependencies);
            await _context.SaveChangesAsync();
        }
        public async Task ClearTaskAssignedUsersAsync(Guid taskId)
        {
            var existingAssignedUsers = _context.AssignedTasks
                                                .Where(tau => tau.TaskId == taskId);
            _context.AssignedTasks.RemoveRange(existingAssignedUsers);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateTaskAsync(ProjectTask task)
        {
            _context.ProjectTasks.Update(task);
            await _context.SaveChangesAsync();
        }
        public async Task<ProjectTask?> GetTaskByIdAsync(Guid taskId)
        {
            return await _context.ProjectTasks
                .Include(t => t.Dependencies)
                .Include(t => t.AssignedUsers)
                    .ThenInclude(au => au.User)
                .FirstOrDefaultAsync(t => t.Id == taskId);
        }
        public async Task DeleteTaskAsync(ProjectTask task)
        {
            _context.ProjectTasks.Remove(task);
            await _context.SaveChangesAsync();
        }
        public async Task<List<ProjectTask>> GetTeamTasksAsync(Guid teamId)
        {
            return await _context.ProjectTasks
                                 .Include(t => t.Solution)
                                 .Include(t => t.Dependencies)
                                 .Include(t => t.AssignedUsers)
                                    .ThenInclude(au => au.User)
                                 .Where(t => t.Solution.TeamId == teamId)
                                 .ToListAsync();
        }
    }
}
