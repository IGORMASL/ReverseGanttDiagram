using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class WorkProject
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid TopicClassId { get; set; }
        [ForeignKey("TopicClassId")]
        public TopicClass TopicClass { get; set; }

        [InverseProperty("Project")]
        public List<Team> Teams { get; set; } = new List<Team>();
        
        [InverseProperty("Project")]
        public List<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();

    }
}
