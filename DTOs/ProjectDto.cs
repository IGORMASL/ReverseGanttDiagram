using GanttChartAPI.Models.Enums;

namespace GanttChartAPI.DTOs
{
    public class ProjectDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public Guid ClassId { get; set; }
    }
}
