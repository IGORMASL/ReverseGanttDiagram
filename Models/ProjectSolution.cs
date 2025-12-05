using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class ProjectSolution
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public WorkProject Project { get; set; }
        public Guid TeamId { get; set; }
        public Team Team { get; set; }
        public ProjectStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        [InverseProperty("Solution")]
        public List<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();
    }
}
