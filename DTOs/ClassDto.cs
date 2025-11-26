using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class ClassDto
    {
        [Required] 
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
    }
}
