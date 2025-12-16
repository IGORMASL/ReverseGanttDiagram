using GanttChartAPI.Models.Enums;

namespace GanttChartAPI.ViewModels
{
    public class ProjectSolutionViewModel
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; }
        public Guid SolutionId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
    }
}
