using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public abstract class ClassRole
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public Guid ClassId { get; set; }
        [ForeignKey("ClassId")]
        public TopicClass TopicClass { get; set; }
        public ClassRole() { }
    }
}
