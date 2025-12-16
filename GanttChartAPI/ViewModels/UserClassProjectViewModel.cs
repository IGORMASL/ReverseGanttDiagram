using GanttChartAPI.Models.Enums;

namespace GanttChartAPI.ViewModels
{
    public class UserClassProjectViewModel
    {
        public Guid Id { get; set; }
        public Guid TeamId { get; set; }
        public Guid SolutionId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
    }
}
