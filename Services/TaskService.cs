using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace GanttChartAPI.Services
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _tasks;
        private readonly IProjectSolutionRepository _solutions;
        private readonly ITeamRepository _teams;
        private readonly IClassRelationRepository _relations;
        public TaskService(ITaskRepository tasks,
                           IProjectSolutionRepository solutions,
                           ITeamRepository teams,
                           IClassRelationRepository relations)
        {
            _tasks = tasks;
            _solutions = solutions;
            _teams = teams;
            _relations = relations;
        }
        public async Task CreateTaskAsync(string userRole, Guid userId, TaskDto task)
        {
            var solution = await _solutions.GetByIdAsync(task.SolutionId)
                ?? throw new NotFoundException("Решение не найдено");
            var team = await _teams.GetByIdAsync(solution.TeamId)
                ?? throw new NotFoundException("Команда не найдена");
            var isUserInTeam = team.Members.Any(m => m.UserId == userId);
            var relation = await _relations.GetUserClassRoleAsync(userId, team.Project.TopicClassId);
            if (userRole != "Admin" && !isUserInTeam && relation is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет доступа к этому решению");
            }
            var projectTask = new ProjectTask
            {
                Id = Guid.NewGuid(),
                Title = task.Title,
                Description = task.Description,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                SolutionId = task.SolutionId
            };
            await _tasks.CreateTaskAsync(projectTask);
        }
        public async Task UpdateTaskAsync(string userRole, Guid userId, Guid taskId, TaskDto task)
        {
            var solution = await _solutions.GetByIdAsync(task.SolutionId)
                ?? throw new NotFoundException("Решение не найдено");
            var team = await _teams.GetByIdAsync(solution.TeamId)
                ?? throw new NotFoundException("Команда не найдена");
            var isUserInTeam = team.Members.Any(m => m.UserId == userId);
            var relation = await _relations.GetUserClassRoleAsync(userId, team.Project.TopicClassId);
            if (userRole != "Admin" && !isUserInTeam && relation is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет доступа к этому решению");
            }
            var projectTask = await _tasks.GetTaskByIdAsync(taskId)
                ?? throw new NotFoundException("Задача не найдена");
            projectTask.Title = task.Title;
            projectTask.Description = task.Description;
            projectTask.StartDate = task.StartDate;
            projectTask.EndDate = task.EndDate;
            await _tasks.UpdateTaskAsync(projectTask);
        }
        public async Task DeleteTaskAsync(string userRole, Guid userId, Guid taskId)
        {
            var projectTask = await _tasks.GetTaskByIdAsync(taskId)
                ?? throw new NotFoundException("Задача не найдена");
            var solution = await _solutions.GetByIdAsync(projectTask.SolutionId)
                ?? throw new NotFoundException("Решение не найдено");
            var team = await _teams.GetByIdAsync(solution.TeamId)
                ?? throw new NotFoundException("Команда не найдена");
            var isUserInTeam = team.Members.Any(m => m.UserId == userId);
            var relation = await _relations.GetUserClassRoleAsync(userId, team.Project.TopicClassId);
            if (userRole != "Admin" && !isUserInTeam && relation is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет доступа к этому решению");
            }
            await _tasks.DeleteTaskAsync(projectTask);
        }
        public async Task<TaskViewModel?> GetTaskByIdAsync(string userRole, Guid userId, Guid taskId)
        {
            var projectTask = await _tasks.GetTaskByIdAsync(taskId)
                ?? throw new NotFoundException("Задача не найдена");
            var solution = await _solutions.GetByIdAsync(projectTask.SolutionId)
                ?? throw new NotFoundException("Решение не найдено");
            var team = await _teams.GetByIdAsync(solution.TeamId)
                ?? throw new NotFoundException("Команда не найдена");
            var isUserInTeam = team.Members.Any(m => m.UserId == userId);
            var relation = await _relations.GetUserClassRoleAsync(userId, team.Project.TopicClassId);
            if (userRole != "Admin" && !isUserInTeam && relation is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет доступа к этому решению");
            }
            return new TaskViewModel
            {
                Id = projectTask.Id,
                Title = projectTask.Title,
                Description = projectTask.Description,
                StartDate = projectTask.StartDate,
                EndDate = projectTask.EndDate,
                SolutionId = projectTask.SolutionId
            };
        }
        public async Task<List<TaskViewModel>> GetTeamTasksAsync(string userRole, Guid userId, Guid teamId)
        {
            var team = await _teams.GetByIdAsync(teamId)
                ?? throw new NotFoundException("Команда не найдена");
            var solution = await _solutions.GetByIdAsync(team.Solution.Id)
                ?? throw new NotFoundException("Решение не найдено");
            var isUserInTeam = team.Members.Any(m => m.UserId == userId);
            var relation = await _relations.GetUserClassRoleAsync(userId, team.Project.TopicClassId);
            if (userRole != "Admin" && !isUserInTeam && relation is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет доступа к этой команде");
            }
            var tasks = await _tasks.GetTeamTasksAsync(teamId);
            return tasks.Select(t => new TaskViewModel
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                SolutionId = t.SolutionId
            }).ToList();
        } 
    }
}
