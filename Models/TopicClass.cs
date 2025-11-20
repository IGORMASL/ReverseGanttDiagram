using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class TopicClass
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        
        [InverseProperty("TopicClass")]
        public List<Project> Projects { get; set; } = new List<Project>();

        public List<TeacherRelation> Teachers { get; set; } = new List<TeacherRelation>();

        public List<StudentRelation> Students { get; set; } = new List<StudentRelation>();
        public TopicClass() { }
    }
}
