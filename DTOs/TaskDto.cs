using GanttChartAPI.Models;
using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.DTOs
{
    public class TaskDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public ProjectTaskType Type { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public Guid? ParentTaskId { get; set; }
        public Guid SolutionId { get; set; }
    }
}
