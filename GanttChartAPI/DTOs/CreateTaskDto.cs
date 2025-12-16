using GanttChartAPI.Models;
using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.DTOs
{
    public class CreateTaskDto
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
        public Guid SolutionId { get; set; }
        public List<Guid> Dependencies { get; set; } = new List<Guid>();
        public List<Guid> AssignedUsers { get; set; } = new List<Guid>();
    }
}
