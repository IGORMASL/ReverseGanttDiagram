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
        public async Task<TaskViewModel> CreateTaskAsync(string userRole, Guid userId, CreateTaskDto dto)
        {
            var solution = await _solutions.GetByIdAsync(dto.SolutionId)
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
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate.Kind == DateTimeKind.Utc ? dto.StartDate : dto.StartDate.ToUniversalTime(),
                EndDate = dto.EndDate.Kind == DateTimeKind.Utc ? dto.EndDate : dto.EndDate.ToUniversalTime(),
                SolutionId = dto.SolutionId,
                ParentTaskId = dto.ParentTaskId
            };
            foreach (var dependsOnId in dto.Dependencies)
            {
                var dependsOnTask = await _tasks.GetTaskByIdAsync(dependsOnId) 
                    ?? throw new NotFoundException($"Задача-зависимость с Id {dependsOnId} не найдена");
                if(dependsOnTask.SolutionId != solution.Id)
                    throw new ForbiddenException("Задача-зависимость принадлежит другому решению");
                projectTask.Dependencies.Add(new TaskDependency
                {
                    TaskId = projectTask.Id,
                    DependsOnTaskId = dependsOnId
                });
            }
            foreach (var assignedUserId in dto.AssignedUsers)
            {
                var isUserInTeamMembers = team.Members.Any(m => m.UserId == assignedUserId);
                if (!isUserInTeamMembers)
                    throw new ForbiddenException("Назначенный пользователь не является участником команды");
                projectTask.AssignedUsers.Add(new AssignedTask
                {
                    UserId = assignedUserId,
                    TaskId = projectTask.Id
                });
            }

            await _tasks.CreateTaskAsync(projectTask);
            return MapToView(projectTask);
        }
        public async Task<TaskViewModel> UpdateTaskAsync(string userRole, Guid userId, Guid taskId, UpdateTaskDto dto)
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
            projectTask.Title = dto.Title;
            projectTask.Description = dto.Description;
            projectTask.StartDate = dto.StartDate.Kind == DateTimeKind.Utc ? dto.StartDate : dto.StartDate.ToUniversalTime();
            projectTask.EndDate = dto.EndDate.Kind == DateTimeKind.Utc ? dto.EndDate : dto.EndDate.ToUniversalTime();
            await _tasks.ClearTaskDependenciesAsync(projectTask.Id);
            projectTask.Dependencies.Clear();
            foreach (var dependsOnId in dto.Dependencies)
            {
                var dependsOnTask = await _tasks.GetTaskByIdAsync(dependsOnId)
                    ?? throw new NotFoundException($"Задача-зависимость с Id {dependsOnId} не найдена");
                if (dependsOnTask.SolutionId != solution.Id)
                    throw new ForbiddenException("Задача-зависимость принадлежит другому решению");
                projectTask.Dependencies.Add(new TaskDependency
                {
                    TaskId = projectTask.Id,
                    DependsOnTaskId = dependsOnId
                });
            }
            await _tasks.ClearTaskAssignedUsersAsync(projectTask.Id);
            projectTask.AssignedUsers.Clear();
            foreach (var assignedUserId in dto.AssignedUsers)
            {
                var isUserInTeamMembers = team.Members.Any(m => m.UserId == assignedUserId);
                if (!isUserInTeamMembers)
                    throw new ForbiddenException("Назначенный пользователь не является участником команды");
                projectTask.AssignedUsers.Add(new AssignedTask
                {
                    UserId = assignedUserId,
                    TaskId = projectTask.Id
                });
            }
            await _tasks.UpdateTaskAsync(projectTask);
            return MapToView(projectTask);
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
                throw new ForbiddenException("У вас нет доступа к этой задаче");
            }
            return (MapToView(projectTask));
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
                throw new ForbiddenException("У вас нет доступа к задачам этой команды");
            }
            var tasks = await _tasks.GetTeamTasksAsync(teamId);
            return tasks.Select(MapToView).ToList();
        }
        public TaskViewModel MapToView(ProjectTask task)
        {
            return new TaskViewModel
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                AssignedUsers = task.AssignedUsers
                    .Select(a => new TeamMemberViewModel { Id = a.User.Id, FullName = a.User.FullName, Email = a.User.Email })
                    .ToList(),
                Dependencies = task.Dependencies
                    .Select(d => d.DependsOnTaskId)
                    .ToList(),
            };
        }
    }
}
