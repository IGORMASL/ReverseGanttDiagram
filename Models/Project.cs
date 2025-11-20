using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class Project
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        public Guid TopicClassId { get; set; }
        [ForeignKey("TopicClassId")]
        public TopicClass TopicClass { get; set; }

        public TaskStatus Status { get; set; }

        [InverseProperty("Project")]
        public List<Team> Teams { get; set; } = new List<Team>();
        
        [InverseProperty("Project")]
        public List<ProjectTask> ProjectTasks { get; set; } = new List<ProjectTask>();

    }
}
