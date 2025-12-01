using GanttChartAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.ViewModels
{
    public class InviteViewModel
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public bool IsTeacherInvite { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsMultiUse { get; set; }
        public bool IsUsed { get; set; }
    }
}
