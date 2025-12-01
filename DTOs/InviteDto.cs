using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.DTOs
{
    public class InviteDto
    {

        [DefaultValue(false)]
        public bool IsTeacherInvite { get; set; } = false;
        [DefaultValue(24)]
        public int ExpireHours { get; set; } = 24;
        [DefaultValue(false)]
        public bool IsMultiUse { get; set; } = false;
    }
}
