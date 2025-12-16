using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class ProjectSolution
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid ProjectId { get; set; }
        public WorkProject Project { get; set; }
        [Required]
        public Guid TeamId { get; set; }
        public Team Team { get; set; }
        public ProjectStatus Status { get; set; }

        [InverseProperty("Solution")]
        public List<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();
    }
}
