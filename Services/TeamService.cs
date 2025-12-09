using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Models.Enums;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using System.Security.Cryptography.X509Certificates;

namespace GanttChartAPI.Services
{
    public class TeamService : ITeamService
    {
        private readonly ITeamRepository _teams;
        private readonly IProjectSolutionRepository _teamSolutions;
        private readonly IProjectRepository _projects;
        private readonly ITopicClassRepository _classes;
        private readonly IClassRelationRepository _classRelations;
        public TeamService(ITeamRepository teams, 
            IProjectSolutionRepository teamSolutions, 
            IProjectRepository projects,
            ITopicClassRepository classes,
            IClassRelationRepository relations)
        {
            _teams = teams;
            _teamSolutions = teamSolutions;
            _projects = projects;
            _classes = classes;
            _classRelations = relations;
        }
        public async Task<TeamViewModel> CreateTeamAsync(string creatorRole, Guid creatorId, CreateTeamDto team)
        {
            var project = await _projects.GetByIdAsync(team.ProjectId) ??
                throw new NotFoundException("Проект не найден");
            var topicClass = await _classes.GetByIdAsync(project.TopicClassId) ??
                throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(creatorId, topicClass.Id);
            if (creatorRole != "Admin" && classRole is not TeacherRelation)
                throw new ForbiddenException("Недостаточно прав для создания команды в данном проекте");
            var newTeam = await _teams.CreateAsync(new Team
            {
                Id = Guid.NewGuid(),
                Name = team.Name,
                ProjectId = team.ProjectId
            });
            await _teamSolutions.CreateAsync(new ProjectSolution
            {
                Id = Guid.NewGuid(),
                TeamId = newTeam.Id,
                ProjectId = newTeam.ProjectId,
                Status = project.Status
            });
            return new TeamViewModel
            {
                Id = newTeam.Id,
                Name = newTeam.Name,
                ProjectId = newTeam.ProjectId,
                Members = new List<TeamMemberViewModel>()
            };
        }
        public async Task<TeamViewModel> UpdateTeamAsync(string userRole, Guid userId, Guid teamId, UpdateTeamDto team)
        {
            var existingTeam = await _teams.GetByIdAsync(teamId) ??
                throw new NotFoundException("Такой команды не существует");
            var project = await _projects.GetByIdAsync(existingTeam.ProjectId) ??
                throw new NotFoundException("Проект не найден");
            var topicClass = await _classes.GetByIdAsync(project.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, topicClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
                throw new ForbiddenException("Недостаточно прав для редактирования команды в данном проекте");
            existingTeam.Name = team.Name;
            var updatedTeam = await _teams.UpdateAsync(existingTeam);
            return new TeamViewModel
            {
                Id = updatedTeam.Id,
                Name = updatedTeam.Name,
                ProjectId = updatedTeam.ProjectId,
                Members = updatedTeam.Members.Select(m => new TeamMemberViewModel
                {
                    Id = m.UserId,
                    FullName = m.User.FullName,
                    Email = m.User.Email
                }).ToList()
            };
        }
        public async Task<TeamViewModel> AddTeamMemberAsync(string userRole, Guid userId, Guid memberId, Guid teamId)
        {
            var team = await _teams.GetByIdAsync(teamId) ??
                throw new NotFoundException("Такой команды не существует");
            var project = await _projects.GetByIdAsync(team.ProjectId) ??
                throw new NotFoundException("Проект не найден");
            var topicClass = await _classes.GetByIdAsync(project.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
            var memberClassRole = await _classRelations.GetUserClassRoleAsync(memberId, topicClass.Id) ??
                throw new InvalidOperationException("Пользователь не является учеником этого класса");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, topicClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
                throw new ForbiddenException("Недостаточно прав для добавления участника команды в данном проекте");
            if (team.Members.Any(m => m.UserId == memberId))
                throw new ForbiddenException("Пользователь уже является участником команды");
            await _teams.AddTeamMemberAsync(new TeamMember
            {
                UserId = memberId,
                TeamId = teamId
            });
            var updatedTeam = await _teams.GetByIdAsync(teamId);
            return new TeamViewModel
            {
                Id = updatedTeam.Id,
                Name = updatedTeam.Name,
                ProjectId = updatedTeam.ProjectId,
                Members = updatedTeam.Members.Select(m => new TeamMemberViewModel
                {
                    Id = m.UserId,
                    FullName = m.User.FullName,
                    Email = m.User.Email
                }).ToList()
            };
        }
        public async Task<List<TeamViewModel>> GetProjectTeamsAsync(string userRole, Guid userId, Guid projectId)
        {
            var project = await _projects.GetByIdAsync(projectId) ??
                throw new NotFoundException("Проект не найден");
            var topicClass = await _classes.GetByIdAsync(project.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, topicClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
                throw new ForbiddenException("Недостаточно прав для просмотра команд проекта");
            var teams = await _teams.GetProjectTeamsAsync(projectId);
            return teams.Select(t => new TeamViewModel
            {
                Id = t.Id,
                Name = t.Name,
                ProjectId = t.ProjectId,
                Members = t.Members.Select(m => new TeamMemberViewModel
                {
                    Id = m.UserId,
                    FullName = m.User.FullName,
                    Email = m.User.Email
                }).ToList()
            }).ToList();
        }
        public async Task<TeamViewModel> GetTeamByIdAsync(string userRole, Guid userId, Guid teamId)
        {
            var team = await _teams.GetByIdAsync(teamId) ??
                throw new NotFoundException("Такой команды не существует");
            var project = await _projects.GetByIdAsync(team.ProjectId) ??
                throw new NotFoundException("Проект не найден");
            var topicClass = await _classes.GetByIdAsync(project.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, topicClass.Id);
            var isUserInTeam = team.Members.Any(m => m.UserId == userId);
            if (userRole != "Admin" && !isUserInTeam && classRole is not TeacherRelation)
                throw new ForbiddenException("Недостаточно прав для просмотра данных команды");
            return new TeamViewModel
            {
                Id = team.Id,
                Name = team.Name,
                ProjectId = team.ProjectId,
                Members = team.Members.Select(m => new TeamMemberViewModel
                {
                    Id = m.UserId,
                    FullName = m.User.FullName,
                    Email = m.User.Email
                }).ToList()
            };
        }
    }
}
