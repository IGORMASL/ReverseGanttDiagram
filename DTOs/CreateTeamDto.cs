using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class CreateTeamDto
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public Guid ProjectId { get; set; }
    }
}
