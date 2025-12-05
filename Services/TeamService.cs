using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Models.Enums;
using GanttChartAPI.Repositories;
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
        public async Task CreateTeamAsync(string creatorRole, Guid creatorId, TeamDto team)
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
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status
            });
        }
        public async Task AddTeamMemberAsync(string userRole, Guid userId, Guid memberId, Guid teamId)
        {
            var team = await _teams.GetByIdAsync(teamId) ??
                throw new NotFoundException("Такой команды не существует");
            var project = await _projects.GetByIdAsync(team.ProjectId) ??
                throw new NotFoundException("Проект не найден");
            var topicClass = await _classes.GetByIdAsync(project.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
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
        }
    }
}
