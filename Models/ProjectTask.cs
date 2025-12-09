using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class ProjectTask
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ProjectTaskType Type { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public Guid? ParentTaskId { get; set; }
        [ForeignKey("ParentTaskId")]
        public ProjectTask? ParentTask { get; set; }
        public Guid SolutionId { get; set; }
        [ForeignKey("SolutionId")]
        public ProjectSolution Solution { get; set; }
        public List<TaskDependency> Dependencies { get; set; } = new List<TaskDependency>();
        public List<ProjectTask> Subtasks { get; set; } = new List<ProjectTask>();
        public List<AssignedTask> AssignedUsers { get; set; } = new List<AssignedTask>();

        public ProjectTask()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
