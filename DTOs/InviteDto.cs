using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class InviteDto
    {
        [Required]
        public bool IsTeacherInvite { get; set; } = false;
        public int ExpireHours { get; set; } = 24;
    }
}
