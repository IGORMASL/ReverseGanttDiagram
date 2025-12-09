using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class UpdateTeamDto
    {
        [Required]
        public string Name { get; set; }
    }
}
