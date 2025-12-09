using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class CreateProjectDto
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        [Required]
        public Guid ClassId { get; set; }
    }
}
