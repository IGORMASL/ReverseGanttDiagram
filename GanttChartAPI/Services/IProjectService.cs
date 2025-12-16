using GanttChartAPI.DTOs;
using GanttChartAPI.ViewModels;
using Microsoft.EntityFrameworkCore.Query;

namespace GanttChartAPI.Services
{
    public interface IProjectService
    {
        Task<ProjectViewModel> CreateProjectAsync(string creatorRole, Guid creatorId, CreateProjectDto proj);
        Task<ProjectViewModel> UpdateProjectAsync(string userRole, Guid userId, Guid projId, UpdateProjectDto proj);
        Task DeleteProjectAsync(string userRole, Guid userId, Guid projId);
        Task<List<ProjectViewModel>> GetClassProjectsAsync(string userRole, Guid userId, Guid classId);
        Task<ProjectViewModel?> GetProjectByIdAsync(string userRole, Guid userId, Guid id);
        Task<List<UserClassProjectViewModel>> GetUserClassProjectsAsync(Guid userId, Guid classId);
        Task<List<ProjectSolutionViewModel>> GetAllProjectSolutionsAsync(string userRole, Guid userId, Guid projectId);
    }
}
