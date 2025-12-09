using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using System.Data;

namespace GanttChartAPI.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projects;
        private readonly ITopicClassRepository _classes;
        private readonly IClassRelationRepository _classRelations;
        private readonly IProjectSolutionRepository _solutions;
        public ProjectService(IProjectRepository projects, 
            ITopicClassRepository calsses, 
            IClassRelationRepository classRelations,
            IProjectSolutionRepository solutions)
        {

            _projects = projects;
            _classes = calsses;
            _classRelations = classRelations;
            _solutions = solutions;
        }
        public async Task<ProjectViewModel> CreateProjectAsync(string creatorRole, Guid creatorId, CreateProjectDto proj)
        {
            var projectClass = await _classes.GetByIdAsync(proj.ClassId) ??
                throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(creatorId, projectClass.Id);
            if (creatorRole != "Admin" && classRole is not TeacherRelation)
            {
                throw new ForbiddenException("Недостаточно прав для создания проекта в этом классе");
            }
            var project = new WorkProject
            {
                Id = Guid.NewGuid(),
                Title = proj.Title,
                Description = proj.Description,
                StartDate = proj.StartDate,
                EndDate = proj.EndDate,
                Status = proj.Status,
                TopicClassId = proj.ClassId
            };
            await _projects.CreateAsync(project);
            return new ProjectViewModel
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status
            };
        }
        public async Task<ProjectViewModel> UpdateProjectAsync(string userRole, Guid userId, Guid projId, UpdateProjectDto proj)
        {
            
            var existingProject = await _projects.GetByIdAsync(projId);
            if (existingProject == null)
            {
                throw new NotFoundException("Проект не найден");
            }
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, existingProject.TopicClassId);
            if (userRole != "Admin" && classRole is not TeacherRelation)
            {
                throw new ForbiddenException("Недостаточно прав для редактирования проекта в этом классе");
            }
            existingProject.Title = proj.Title;
            existingProject.Description = proj.Description;
            existingProject.StartDate = proj.StartDate;
            existingProject.EndDate = proj.EndDate;
            existingProject.Status = proj.Status;
            await _projects.UpdateAsync(existingProject);
            return new ProjectViewModel
            {
                Id = existingProject.Id,
                Title = existingProject.Title,
                Description = existingProject.Description,
                StartDate = existingProject.StartDate,
                EndDate = existingProject.EndDate,
                Status = existingProject.Status
            };
        }
        public async Task DeleteProjectAsync(string userRole, Guid userId, Guid projId)
        {
            var existingProject = await _projects.GetByIdAsync(projId);
            if (existingProject == null)
            {
                throw new Exception("Проект не найден");
            }
            var projectClass = await _classes.GetByIdAsync(existingProject.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, projectClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
            {
                throw new ForbiddenException("Недостаточно прав для удаления проекта в этом классе");
            }
            await _projects.DeleteAsync(existingProject);
        }
        public async Task<List<ProjectViewModel>> GetClassProjectsAsync(string userRole, Guid userId, Guid classId)
        {
            var projectClass = await _classes.GetByIdAsync(classId) ??
                throw new NotFoundException("Класс не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, projectClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
            {
                throw new ForbiddenException("Недостаточно прав для просмотра проектов в этом классе");
            }
            var projects = await _projects.GetClassProjectsAsync(classId);
            return projects.Select(proj => new ProjectViewModel
            {
                Id = proj.Id,
                Title = proj.Title,
                Description = proj.Description,
                StartDate = proj.StartDate,
                EndDate = proj.EndDate,
                Status = proj.Status,
                ClassId = proj.TopicClassId
            }).ToList();
        }
        public async Task<ProjectViewModel?> GetProjectByIdAsync(string userRole, Guid userId, Guid id)
        {
            var proj = await _projects.GetByIdAsync(id) ?? 
                throw new NotFoundException("Проект не найден");
            var projectClass = await _classes.GetByIdAsync(proj.TopicClassId) ??
                throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, projectClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
            {
                throw new ForbiddenException("Недостаточно прав для просмотра этого проекта");
            }

            return new ProjectViewModel
            {
                Id = proj.Id,
                Title = proj.Title,
                Description = proj.Description,
                StartDate = proj.StartDate,
                EndDate = proj.EndDate,
                Status = proj.Status,
                ClassId = proj.TopicClassId
            };
        }
        public async Task<List<UserClassProjectViewModel>> GetUserClassProjectsAsync(Guid userId, Guid classId)
        {
            var topicClass = await _classes.GetByIdAsync(classId) ??
                throw new NotFoundException("Класс не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, classId);
            if (classRole == null)
            {
                throw new ForbiddenException("У вас нет проектов в этом классе");
            }
            var solutions = await _solutions.GetUserClassSolutionsAsync(userId, classId);
            return solutions.Select(sol => new UserClassProjectViewModel
            {
                Id = sol.ProjectId,
                TeamId = sol.TeamId,
                SolutionId = sol.Id,
                Title = sol.Project.Title,
                Description = sol.Project.Description,
                StartDate = sol.Project.StartDate,
                EndDate = sol.Project.EndDate,
                Status = sol.Status
            }).ToList();
        }
        public async Task<List<ProjectSolutionViewModel>> GetAllProjectSolutionsAsync(string userRole, Guid userId, Guid projectId)
        {
            var existingProject = await _projects.GetByIdAsync(projectId) ??
                throw new Exception("Проект не найден");
            var projectClass = await _classes.GetByIdAsync(existingProject.TopicClassId) ??
               throw new NotFoundException("Класс проекта не найден");
            var classRole = await _classRelations.GetUserClassRoleAsync(userId, projectClass.Id);
            if (userRole != "Admin" && classRole is not TeacherRelation)
            {
                throw new ForbiddenException("Недостаточно прав для просмотра решений проектов в этом классе");
            }
            var solutions = await _solutions.GetAllProjectSolutionsAsync(projectId);
            return solutions.Select(sol => new ProjectSolutionViewModel
            {
                Id = sol.ProjectId,
                TeamId = sol.TeamId,
                TeamName = sol.Team.Name,
                SolutionId = sol.Id,
                StartDate = sol.Project.StartDate,
                EndDate = sol.Project.EndDate,
                Status = sol.Status
            }).ToList();
        }
    }
}
