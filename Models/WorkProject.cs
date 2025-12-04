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
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        public Guid TopicClassId { get; set; }
        [ForeignKey("TopicClassId")]
        public TopicClass TopicClass { get; set; }
        public List<Team> Teams { get; set; } = new List<Team>();
        public List<ProjectSolution> Solutions { get; set; } = new List<ProjectSolution>();
    }
}
