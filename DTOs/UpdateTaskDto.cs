using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class UpdateTaskDto
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public ProjectTaskType Type { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public Guid? ParentTaskId { get; set; }
        public List<Guid> Dependencies { get; set; } = new List<Guid>();
        public List<Guid> AssignedUsers { get; set; } = new List<Guid>();
    }
}
