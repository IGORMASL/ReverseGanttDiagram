using GanttChartAPI.Models;

namespace GanttChartAPI.Repositories
{
    public interface IProjectSolutionRepository
    {
        Task AddTeamSollutionAsync(ProjectSolution projectSolution);
    }
}
