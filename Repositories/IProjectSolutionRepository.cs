using GanttChartAPI.Models;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace GanttChartAPI.Repositories
{
    public interface IProjectSolutionRepository
    {
        Task<ProjectSolution> CreateAsync(ProjectSolution projectSolution);
        Task<List<ProjectSolution>> GetUserClassSolutionsAsync(Guid userId, Guid classId);
        Task<List<ProjectSolution>> GetAllProjectSolutionsAsync(Guid projectId);
        Task<ProjectSolution?> GetByIdAsync(Guid solutionId);
    }
}
