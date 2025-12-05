using GanttChartAPI.Models;
using Microsoft.Extensions.Configuration.UserSecrets;

namespace GanttChartAPI.Repositories
{
    public interface IProjectSolutionRepository
    {
        Task CreateAsync(ProjectSolution projectSolution);
        Task<List<ProjectSolution>> GetUserClassSolutionsAsync(Guid userId, Guid classId);
    }
}
