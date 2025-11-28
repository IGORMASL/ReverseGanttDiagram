using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class ClassInvite
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid ClassId { get; set; }
        [ForeignKey("ClassId")]
        public TopicClass Class { get; set; }
        [Required]
        public bool IsTeacherInvite { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;
    }
}
